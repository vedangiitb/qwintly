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

  constructor(params: {
    message: string;
    endpoint: string;
    operation: string;
    cause?: unknown;
  }) {
    super(params.message);
    this.name = "GenerateClientError";
    this.endpoint = params.endpoint;
    this.operation = params.operation;
    this.cause = params.cause;
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
}

export interface GenerationStatusHistoryEvent {
  event_type: string;
  step: string | null;
  message: string | null;
  seq_num: number;
  created_at: string;
}

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
      type: "current_status";
      payload: string | null;
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

export interface GenerateClientContract {
  approvePlan(params: ApprovePlanParams): Promise<ApprovePlanResult>;
  streamGenerationStatus(params: StreamGenerationStatusParams): Promise<void>;
}

const GENERATE_ENDPOINTS = {
  APPROVE_PLAN: "/api/generate/approve-plan",
  FETCH_STATUS: "/api/generate/fetch-status",
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

  if (value.type === "current_status") {
    return {
      type: "current_status",
      payload: typeof value.payload === "string" ? value.payload : null,
    };
  }

  if (value.type === "event") {
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
      type: "event",
      payload,
    };
  }

  return null;
};

export class GenerateClient implements GenerateClientContract {
  constructor(
    private readonly httpClient: HttpClient = new FetchUtilHttpClient(),
  ) {}

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
              const dataLines = frame
                .split("\n")
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

              params.onEvent(event);
            });
          }
        } finally {
          reader.releaseLock();
        }
      },
    );
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

      throw new GenerateClientError({
        message: toClientErrorMessage(
          error,
          "Unexpected error occurred while calling generate API.",
        ),
        endpoint,
        operation,
        cause: error,
      });
    }
  }
}

export const generateClient: GenerateClientContract = new GenerateClient();
