// features/generate/server/services/generationStatus.service.ts

import { redis } from "@/lib/redis";
import { StatusRepository } from "../repositories/status.repository";

type RedisStreamFields = Record<string, string>;

const TERMINAL_EVENTS = new Set(["generation_completed", "generation_failed"]);

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const compareStreamIds = (a: string, b: string): number => {
  const [aMsRaw, aSeqRaw = "0"] = a.split("-");
  const [bMsRaw, bSeqRaw = "0"] = b.split("-");
  const aMs = Number(aMsRaw);
  const bMs = Number(bMsRaw);
  if (Number.isFinite(aMs) && Number.isFinite(bMs) && aMs !== bMs) {
    return aMs - bMs;
  }
  const aSeq = Number(aSeqRaw);
  const bSeq = Number(bSeqRaw);
  if (Number.isFinite(aSeq) && Number.isFinite(bSeq) && aSeq !== bSeq) {
    return aSeq - bSeq;
  }
  return a.localeCompare(b);
};

export const createGenerationStatusStream = (
  chatId: string,
  token: string,
  signal?: AbortSignal,
): ReadableStream => {
  const statusRepository = new StatusRepository(token);

  return new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();

      let closed = false;
      const closeStream = () => {
        if (closed) return;
        closed = true;
        try {
          controller.close();
        } catch {
          // ignored
        }
      };

      const keepAlive = () => {
        if (closed) return;
        controller.enqueue(encoder.encode(": keep-alive\r\n\r\n"));
      };

      const send = (params: { type: string; payload: unknown; id?: string }) => {
        if (closed) return;

        const lines: string[] = [];
        lines.push(`event: ${params.type}`);
        if (params.id) {
          lines.push(`id: ${params.id}`);
        }
        lines.push(
          `data: ${JSON.stringify({ type: params.type, payload: params.payload })}`,
        );

        controller.enqueue(encoder.encode(`${lines.join("\r\n")}\r\n\r\n`));
      };

      if (signal?.aborted) {
        closeStream();
        return;
      }

      const abortListener = () => closeStream();
      signal?.addEventListener("abort", abortListener, { once: true });

      try {
        console.log(`[SSE] Starting stream for chatId: ${chatId}`);

        // Prime the stream to bypass buffering proxies
        controller.enqueue(encoder.encode(": " + " ".repeat(1024) + "\r\n\r\n"));

        send({ type: "connection", payload: { status: "initializing", chatId } });

        let genId = "";
        const startTime = Date.now();
        const timeout = 120000; // 2 minutes

        while (!genId) {
          if (closed) return;

          genId = await statusRepository.getGenSession(chatId);

          if (genId) break;

          if (Date.now() - startTime > timeout) {
            send({ type: "error", payload: "failed to start generation" });
            closeStream();
            return;
          }

          keepAlive();
          await sleep(2500);
        }

        if (closed) return;

        send({ type: "connection", payload: { status: "ready", chatId, genId } });

        const history = await statusRepository.fetchGenerationHistory(chatId, genId);
        send({ type: "history", payload: history });

        const streamKey = `chat:${chatId}:gen:${genId}:events`;

        // Tail event (helps when DB history is stale or empty)
        const tail = (await redis.xrevrange<RedisStreamFields>(
          streamKey,
          "+",
          "-",
          1,
        )) as Record<string, RedisStreamFields>;

        const tailEntries = Object.entries(tail);
        let lastId = "0-0";

        if (tailEntries.length) {
          const [tailId, tailFields] = tailEntries[0];
          lastId = tailId;

          const nowIso = new Date().toISOString();
          const payload: RedisStreamFields = {
            ...tailFields,
            created_at: tailFields.created_at || nowIso,
          };

          send({ type: "current", payload, id: tailId });

          if (TERMINAL_EVENTS.has(payload.event_type)) {
            closeStream();
            return;
          }
        }

        // Upstash REST does not support blocking XREAD; poll via XRANGE
        const pollIntervalMs = 1500;
        const pollBatchSize = 50;

        while (!closed) {
          if (controller.desiredSize === null) break;

          const range = (await redis.xrange<RedisStreamFields>(
            streamKey,
            `(${lastId}`,
            "+",
            pollBatchSize,
          )) as Record<string, RedisStreamFields>;

          const entries = Object.entries(range).sort(([aId], [bId]) =>
            compareStreamIds(aId, bId),
          );

          if (!entries.length) {
            keepAlive();
            await sleep(pollIntervalMs);
            continue;
          }

          for (const [id, fields] of entries) {
            if (closed) return;
            lastId = id;

            const nowIso = new Date().toISOString();
            const payload: RedisStreamFields = {
              ...fields,
              created_at: fields.created_at || nowIso,
            };

            send({ type: "event", payload, id });

            if (TERMINAL_EVENTS.has(payload.event_type)) {
              closeStream();
              return;
            }
          }
        }
      } catch (err) {
        console.error("Stream error in generationStatus.service.ts:", err);
        try {
          send({
            type: "error",
            payload: err instanceof Error ? err.message : "Internal stream error",
          });
        } catch {
          // ignored
        }
        closeStream();
        try {
          controller.error(err);
        } catch {
          // ignored
        }
      } finally {
        signal?.removeEventListener("abort", abortListener);
        closeStream();
      }
    },
  });
};

