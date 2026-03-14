// features/generate/server/services/generationStatus.service.ts

import { redis } from "@/lib/redis";
import { StatusRepository } from "../repositories/status.repository";

export const createGenerationStatusStream = (
  chatId: string,
  token: string,
): ReadableStream => {
  const statusRepository = new StatusRepository(token);

  return new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();

      const send = (data: unknown) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      };

      try {
        // 1️⃣ Load history from DB
        const history = await statusRepository.fetchGenerationHistory(chatId);

        send({
          type: "history",
          payload: history,
        });

        // 2️⃣ Send current status from Redis
        const state = await redis.hgetall<{ current_status?: string }>(
          `chat:${chatId}:state`,
        );

        send({
          type: "current_status",
          payload: state?.current_status ?? null,
        });

        // 3️⃣ Stream new events
        let lastId = "$";

        while (true) {
          if (controller.desiredSize === null) break;

          const response = (await redis.xread(`chat:${chatId}:events`, lastId, {
            blockMS: 5000,
          })) as Array<{
            id: string;
            messages: Array<{ id: string; fields: Record<string, string> }>;
          }>;

          if (!response) continue;

          for (const stream of response) {
            for (const message of stream.messages) {
              lastId = message.id;

              send({
                type: "event",
                payload: message.fields,
              });

              // Stop stream if generation finished
              if (
                message.fields.event_type === "generation_completed" ||
                message.fields.event_type === "generation_failed"
              ) {
                controller.close();
                return;
              }
            }
          }
        }
      } catch (err) {
        controller.error(err);
      }
    },
  });
};
