// features/generate/server/services/generationStatus.service.ts

import { redis } from "@/lib/redis";
import { StatusRepository } from "../repositories/status.repository";

type RedisStreamFields = Record<string, string>;

const TERMINAL_EVENTS = new Set(["generation_completed", "generation_failed"]);

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

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

      const keepAliveIntervalMs = 15000;
      let lastKeepAliveAt = 0;
      const keepAliveIfDue = () => {
        const now = Date.now();
        if (now - lastKeepAliveAt < keepAliveIntervalMs) return;
        lastKeepAliveAt = now;
        keepAlive();
      };

      const send = (params: {
        type: string;
        payload: unknown;
        id?: string;
      }) => {
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
        controller.enqueue(
          encoder.encode(": " + " ".repeat(1024) + "\r\n\r\n"),
        );

        send({
          type: "connection",
          payload: { status: "initializing", chatId },
        });

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

          keepAliveIfDue();
          await sleep(2500);
        }

        if (closed) return;

        send({
          type: "connection",
          payload: { status: "ready", chatId, genId },
        });

        const history = await statusRepository.fetchGenerationHistory(
          chatId,
          genId,
        );
        send({ type: "history", payload: history });

        const streamKey = `chat:${chatId}:gen:${genId}:events`;
        const stateKey = `chat:${chatId}:state:${genId}`;

        let lastId = "0-0";
        let lastSeqSeen = 0;

        type RedisGenerationState = {
          event_type?: string | null;
          step?: string | null;
          message?: string | null;
          seq_num?: string | null;
          last_seq?: string | null;
        };

        const state = (await redis.hmget(
          stateKey,
          "event_type",
          "step",
          "message",
          "seq_num",
          "last_seq",
        )) as RedisGenerationState | null;

        if (state && typeof state.event_type === "string" && state.event_type) {
          const seqNumRaw =
            (typeof state.seq_num === "string" && state.seq_num) ||
            (typeof state.last_seq === "string" && state.last_seq) ||
            "0";
          const parsedSeq = Number.parseInt(seqNumRaw, 10);
          lastSeqSeen = Number.isFinite(parsedSeq) ? parsedSeq : 0;

          const nowIso = new Date().toISOString();
          const payload: RedisStreamFields = {
            event_type: state.event_type,
            step: typeof state.step === "string" ? state.step : "",
            message: typeof state.message === "string" ? state.message : "",
            seq_num: seqNumRaw,
            created_at: nowIso,
          };

          send({ type: "current", payload });

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

          const entries = Object.entries(range);

          if (!entries.length) {
            keepAliveIfDue();
            await sleep(pollIntervalMs);
            continue;
          }

          for (const [id, fields] of entries) {
            if (closed) return;
            lastId = id;

            const seqRaw = fields.seq_num;
            const parsedSeq = seqRaw ? Number.parseInt(seqRaw, 10) : Number.NaN;
            if (Number.isFinite(parsedSeq) && parsedSeq <= lastSeqSeen) {
              continue;
            }

            const nowIso = new Date().toISOString();
            const payload: RedisStreamFields = {
              ...fields,
              created_at: fields.created_at || nowIso,
            };

            send({ type: "event", payload, id });

            if (Number.isFinite(parsedSeq)) {
              lastSeqSeen = parsedSeq;
            }

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
            payload:
              err instanceof Error ? err.message : "Internal stream error",
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
