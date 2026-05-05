import {
  HttpClient,
  FetchUtilHttpClient,
  toClientErrorMessage,
  ensureNonEmptyString,
  buildUrl,
  isAbortError,
} from "../../../shared/ui/api/client.shared";

export class GenerateClientError extends Error {
  public readonly endpoint: string;
  public readonly operation: string;
  public readonly cause: unknown;
  public readonly statusCode?: number;

  constructor(params: {
    message: string;
    endpoint: string;
    operation: string;
    cause?: unknown;
    statusCode?: number;
  }) {
    super(params.message);
    this.name = "GenerateClientError";
    this.endpoint = params.endpoint;
    this.operation = params.operation;
    this.cause = params.cause;
    this.statusCode = params.statusCode;
  }
}

export interface ApprovePlanParams {
  chatId: string;
  planId: string;
  signal?: AbortSignal;
}

export interface ApprovePlanResult {
  success: true;
  messageId: string;
  approvalMessageId: string;
}

export interface GenerationStatusHistoryEvent {
  event_type: string;
  step: string | null;
  message: string | null;
  seq_num: number;
  created_at: string;
}

export type GenerationSummary = {
  status: string;
  messages: string[];
};

export type GenerationRealtimeStatusEvent = {
  event_type: string;
  step?: string;
  message?: string;
  seq_num?: string;
  created_at?: string;
  [key: string]: string | undefined;
};

export type GenerationStreamEvent =
  | {
      type: "history";
      payload: GenerationStatusHistoryEvent[];
    }
  | {
      type: "current";
      payload: GenerationRealtimeStatusEvent;
    }
  | {
      type: "event";
      payload: GenerationRealtimeStatusEvent;
    };

export interface StreamGenerationStatusParams {
  chatId: string;
  onEvent: (event: GenerationStreamEvent) => void;
  signal?: AbortSignal;
}

export interface FetchGenerationSummaryParams {
  msgId: string;
  signal?: AbortSignal;
}

export interface GenerateClientContract {
  approvePlan(params: ApprovePlanParams): Promise<ApprovePlanResult>;
  streamGenerationStatus(params: StreamGenerationStatusParams): Promise<void>;
  fetchGenerationSummary(
    params: FetchGenerationSummaryParams,
  ): Promise<GenerationSummary>;
}

const GENERATE_ENDPOINTS = {
  APPROVE_PLAN: "/api/generate/approve-plan",
  FETCH_STATUS: "/api/generate/fetch-status",
  FETCH_GEN_SUMMARY: "/api/generate/fetch-gen-summary",
} as const;

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const isHistoryEvent = (
  value: unknown,
): value is GenerationStatusHistoryEvent => {
  if (!isObject(value)) return false;

  return (
    typeof value.event_type === "string" &&
    (typeof value.step === "string" || value.step === null) &&
    (typeof value.message === "string" || value.message === null) &&
    typeof value.seq_num === "number" &&
    typeof value.created_at === "string"
  );
};

const toGenerationStreamEvent = (
  value: unknown,
): GenerationStreamEvent | null => {
  if (!isObject(value) || typeof value.type !== "string") {
    return null;
  }

  if (value.type === "history") {
    const payload = Array.isArray(value.payload)
      ? value.payload.filter(isHistoryEvent)
      : [];

    return {
      type: "history",
      payload,
    };
  }

  if (value.type === "current" || value.type === "event") {
    const payload = isObject(value.payload)
      ? (Object.fromEntries(
          Object.entries(value.payload)
            .filter(
              ([, itemValue]) =>
                itemValue === undefined || typeof itemValue === "string",
            )
            .map(([key, itemValue]) => [key, itemValue as string | undefined]),
        ) as GenerationRealtimeStatusEvent)
      : ({} as GenerationRealtimeStatusEvent);

    if (typeof payload.event_type !== "string") {
      return null;
    }

    return {
      type: value.type,
      payload,
    };
  }

  return null;
};

export class GenerateClient implements GenerateClientContract {
  constructor(
    private readonly httpClient: HttpClient = new FetchUtilHttpClient(),
  ) {}

  private readonly generationSummaryCache = new Map<
    string,
    Promise<GenerationSummary>
  >();

  async approvePlan(params: ApprovePlanParams): Promise<ApprovePlanResult> {
    const chatId = ensureNonEmptyString(params.chatId, "chatId");
    const planId = ensureNonEmptyString(params.planId, "planId");

    return this.execute(
      "approvePlan",
      GENERATE_ENDPOINTS.APPROVE_PLAN,
      async () => {
        const data = await this.httpClient.post<ApprovePlanResult>(
          GENERATE_ENDPOINTS.APPROVE_PLAN,
          {
            chatId,
            planId,
          },
          params.signal,
        );

        if (!data?.success) {
          throw new Error(
            "Generation trigger was not acknowledged by the server",
          );
        }

        ensureNonEmptyString(data.messageId, "messageId");
        ensureNonEmptyString(data.approvalMessageId, "approvalMessageId");

        return data;
      },
    );
  }

  async streamGenerationStatus(
    params: StreamGenerationStatusParams,
  ): Promise<void> {
    const chatId = ensureNonEmptyString(params.chatId, "chatId");

    if (typeof params.onEvent !== "function") {
      throw new GenerateClientError({
        message: "Missing or invalid onEvent callback",
        endpoint: GENERATE_ENDPOINTS.FETCH_STATUS,
        operation: "streamGenerationStatus",
      });
    }

    return this.execute(
      "streamGenerationStatus",
      GENERATE_ENDPOINTS.FETCH_STATUS,
      async () => {
        const url = buildUrl(GENERATE_ENDPOINTS.FETCH_STATUS, {
          chatId,
        });

        const reader = await this.httpClient.getStream(url, params.signal);
        const decoder = new TextDecoder();
        let buffer = "";

        try {
          while (true) {
            const { value, done } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const frames = buffer.split(/\r?\n\r?\n/);
            buffer = frames.pop() ?? "";

            frames.forEach((frame) => {
              const lines = frame.split(/\r?\n/);
              const sseId = lines
                .map((line) => line.trimEnd())
                .find((line) => line.startsWith("id:"))
                ?.slice(3)
                .trim();

              const dataLines = lines
                .filter((line) => line.startsWith("data:"))
                .map((line) => line.slice(5).trim());

              if (!dataLines.length) return;

              const rawPayload = dataLines.join("\n");

              let parsedPayload: unknown;
              try {
                parsedPayload = JSON.parse(rawPayload);
              } catch {
                return;
              }

              const event = toGenerationStreamEvent(parsedPayload);
              if (!event) return;

              if (sseId && (event.type === "event" || event.type === "current")) {
                event.payload = { ...event.payload, sse_id: sseId };
              }

              params.onEvent(event);
            });
          }
        } finally {
          reader.releaseLock();
        }
      },
    );
  }

  async fetchGenerationSummary(
    params: FetchGenerationSummaryParams,
  ): Promise<GenerationSummary> {
    const msgId = ensureNonEmptyString(params.msgId, "msgId");

    const cached = this.generationSummaryCache.get(msgId);
    if (cached) return cached;

    const task = this.execute(
      "fetchGenerationSummary",
      GENERATE_ENDPOINTS.FETCH_GEN_SUMMARY,
      async () => {
        const url = buildUrl(GENERATE_ENDPOINTS.FETCH_GEN_SUMMARY, { msgId });
        const data = await this.httpClient.get<GenerationSummary>(
          url,
          params.signal,
        );

        return {
          status: typeof data?.status === "string" ? data.status : "",
          messages: Array.isArray(data?.messages) ? data.messages : [],
        };
      },
    ).catch((error) => {
      this.generationSummaryCache.delete(msgId);
      throw error;
    });

    this.generationSummaryCache.set(msgId, task);
    return task;
  }

  private async execute<T>(
    operation: string,
    endpoint: string,
    task: () => Promise<T>,
  ): Promise<T> {
    try {
      return await task();
    } catch (error) {
      if (isAbortError(error) || error instanceof GenerateClientError) {
        throw error;
      }

      const statusCode =
        typeof (error as Error & { statusCode?: number })?.statusCode === "number"
          ? (error as Error & { statusCode?: number }).statusCode
          : undefined;

      throw new GenerateClientError({
        message: toClientErrorMessage(
          error,
          "Unexpected error occurred while calling generate API.",
        ),
        endpoint,
        operation,
        cause: error,
        statusCode,
      });
    }
  }
}

export const generateClient: GenerateClientContract = new GenerateClient();
