// features/generate/server/services/generationStatus.service.ts

import { redis } from "@/lib/redis";

type RedisStreamFields = Record<string, string>;

const TERMINAL_EVENTS = new Set(["generation_completed", "generation_failed"]);

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

class GenerationStreamSession {
  private closed = false;
  private lastKeepAliveAt = 0;
  private lastId = "0-0";
  private lastSeqSeen = 0;
  private readonly encoder = new TextEncoder();
  private readonly keepAliveIntervalMs = 15000;
  private readonly pollIntervalMs = 1500;
  private readonly pollBatchSize = 50;
  private abortListener: (() => void) | null = null;

  constructor(
    private readonly controller: ReadableStreamDefaultController,
    private readonly chatId: string,
    private readonly sessionId: string | undefined,
    private readonly signal: AbortSignal | undefined,
  ) {}

  public async start() {
    if (this.signal?.aborted) {
      this.close();
      return;
    }

    this.abortListener = () => this.close();
    this.signal?.addEventListener("abort", this.abortListener, { once: true });

    try {
      console.log(`[SSE] Starting stream for chatId: ${this.chatId}`);

      // Prime the stream to bypass buffering proxies
      this.controller.enqueue(
        this.encoder.encode(": " + " ".repeat(1024) + "\r\n\r\n"),
      );

      this.send({
        type: "connection",
        payload: { status: "initializing", chatId: this.chatId },
      });

      if (!this.sessionId?.trim()) {
        this.send({ type: "error", payload: "Missing sessionId parameter" });
        this.close();
        return;
      }

      const genId = this.sessionId.trim();

      if (this.closed) return;

      this.send({
        type: "connection",
        payload: { status: "ready", chatId: this.chatId, genId },
      });

      const streamKey = `chat:${this.chatId}:gen:${genId}:events`;

      const hasTerminal = await this.bootstrap(streamKey);
      if (hasTerminal || this.closed) {
        this.close();
        return;
      }

      await this.pollLoop(streamKey);
    } catch (err) {
      this.handleError(err);
    } finally {
      this.cleanup();
    }
  }

  private close() {
    if (this.closed) return;
    this.closed = true;
    try {
      this.controller.close();
    } catch {
      // ignored
    }
  }

  private send(params: { type: string; payload: unknown; id?: string }) {
    if (this.closed) return;

    const lines: string[] = [];
    lines.push(`event: ${params.type}`);
    if (params.id) {
      lines.push(`id: ${params.id}`);
    }
    lines.push(
      `data: ${JSON.stringify({ type: params.type, payload: params.payload })}`,
    );

    this.controller.enqueue(this.encoder.encode(`${lines.join("\r\n")}\r\n\r\n`));
  }

  private keepAliveIfDue() {
    const now = Date.now();
    if (now - this.lastKeepAliveAt < this.keepAliveIntervalMs) return;
    this.lastKeepAliveAt = now;
    if (!this.closed) {
      this.controller.enqueue(this.encoder.encode(": keep-alive\r\n\r\n"));
    }
  }

  private async bootstrap(streamKey: string): Promise<boolean> {
    const initialRange = await redis.xrange<RedisStreamFields>(
      streamKey,
      "-",
      "+",
    );

    const initialEntries = initialRange ? Object.entries(initialRange) : [];
    const history: {
      event_type: string;
      step: string | null;
      message: string | null;
      seq_num: number;
      created_at: string;
    }[] = [];

    let hasTerminal = false;

    for (const [id, fields] of initialEntries) {
      this.lastId = id;
      const seqRaw = fields.seq_num;
      const parsedSeq = seqRaw ? Number.parseInt(seqRaw, 10) : Number.NaN;
      const nowIso = new Date().toISOString();

      history.push({
        event_type: fields.event_type,
        step: fields.step || null,
        message: fields.message || null,
        seq_num: Number.isFinite(parsedSeq) ? parsedSeq : 0,
        created_at: fields.created_at || nowIso,
      });

      if (Number.isFinite(parsedSeq)) {
        this.lastSeqSeen = Math.max(this.lastSeqSeen, parsedSeq);
      }

      if (TERMINAL_EVENTS.has(fields.event_type)) {
        hasTerminal = true;
      }
    }

    this.send({ type: "history", payload: history });
    return hasTerminal;
  }

  private async pollLoop(streamKey: string) {
    while (!this.closed) {
      if (this.controller.desiredSize === null) break;

      const range = await redis.xrange<RedisStreamFields>(
        streamKey,
        `(${this.lastId}`,
        "+",
        this.pollBatchSize,
      );

      const entries = Object.entries(range);

      if (!entries.length) {
        this.keepAliveIfDue();
        await sleep(this.pollIntervalMs);
        continue;
      }

      const terminalSeen = this.processEntries(entries);
      if (terminalSeen) {
        this.close();
        return;
      }
    }
  }

  private processEntries(entries: [string, RedisStreamFields][]): boolean {
    for (const [id, fields] of entries) {
      if (this.closed) return false;
      this.lastId = id;

      const seqRaw = fields.seq_num;
      const parsedSeq = seqRaw ? Number.parseInt(seqRaw, 10) : Number.NaN;
      if (Number.isFinite(parsedSeq) && parsedSeq <= this.lastSeqSeen) {
        continue;
      }

      const nowIso = new Date().toISOString();
      const payload: RedisStreamFields = {
        ...fields,
        created_at: fields.created_at || nowIso,
      };

      this.send({ type: "event", payload, id });

      if (Number.isFinite(parsedSeq)) {
        this.lastSeqSeen = parsedSeq;
      }

      if (TERMINAL_EVENTS.has(payload.event_type)) {
        return true;
      }
    }
    return false;
  }

  private handleError(err: unknown) {
    console.error("Stream error in generationStatus.service.ts:", err);
    try {
      this.send({
        type: "error",
        payload: err instanceof Error ? err.message : "Internal stream error",
      });
    } catch {
      // ignored
    }
    this.close();
    try {
      this.controller.error(err);
    } catch {
      // ignored
    }
  }

  private cleanup() {
    if (this.signal && this.abortListener) {
      this.signal.removeEventListener("abort", this.abortListener);
    }
    this.close();
  }
}

export const createGenerationStatusStream = (
  chatId: string,
  sessionId?: string | null,
  signal?: AbortSignal,
): ReadableStream => {
  return new ReadableStream({
    async start(controller) {
      const session = new GenerationStreamSession(
        controller,
        chatId,
        sessionId || undefined,
        signal,
      );
      await session.start();
    },
  });
};
