import { fetchStreamUtil } from "@/utils/fetchUtil";
import {
  Chat,
  FetchChatsResult,
  FetchMessagesResult,
} from "../../types/chat.types";
import { Plan } from "../../../ai/types/updatePlan.types";
import {
  QuestionAnswers,
  UserResponse,
  QuestionStatus,
} from "../../../ai/types/askQuestions.types";
import { ToolCall } from "../../../ai/types/tools.types";
import {
  HttpClient,
  FetchUtilHttpClient,
  toClientErrorMessage,
  ensureNonEmptyString,
  buildUrl,
} from "../../../shared/ui/api/client.shared";

export class ChatClientError extends Error {
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
    this.name = "ChatClientError";
    this.endpoint = params.endpoint;
    this.operation = params.operation;
    this.cause = params.cause;
  }
}

export interface CreateNewChatParams {
  prompt: string;
  convId?: string;
}

export interface FetchChatsParams {
  limit?: number;
  cursor?: string;
}

export interface FetchChatMessagesParams {
  chatId: string;
  limit?: number;
  cursor?: string;
}

export interface SubmitAnswersParams {
  chatId: string;
  answers: UserResponse[];
  questionSetId?: string;
  signal?: AbortSignal;
  onChunk?: (textDelta: string) => void;
}

export interface StreamChatParams {
  chatId: string;
  message: string;
  signal?: AbortSignal;
  onChunk?: (textDelta: string) => void;
}

export interface StreamChatResult {
  agentMessageId: string;
  response: string;
  toolCall: ToolCall | null;
}

export interface SubmitAnswersResult {
  response: string;
  toolCall: ToolCall | null;
  status: QuestionStatus;
  questionSetId: string;
  agentMessageId: string;
}

export interface FetchChatInfoResult {
  questionAnswers: QuestionAnswers[];
  plans: Plan[];
  siteUrl: string;
  previewUrl: string;
  isGenerating: boolean;
}

export interface ChatClientContract {
  createNewChat(params: CreateNewChatParams): Promise<{ id: string }>;
  fetchUserChats(params?: FetchChatsParams): Promise<FetchChatsResult>;
  fetchChatMessages(
    params: FetchChatMessagesParams,
  ): Promise<FetchMessagesResult>;
  fetchChatInfo(chatId: string): Promise<FetchChatInfoResult>;
  submitAnswers(params: SubmitAnswersParams): Promise<SubmitAnswersResult>;
  streamChat(params: StreamChatParams): Promise<StreamChatResult>;
}

const CHAT_ENDPOINTS = {
  CREATE_NEW_CHAT: "/api/chat/create-new-chat",
  FETCH_USER_CHATS: "/api/chat/fetch-user-chats",
  FETCH_CHAT_MESSAGES: "/api/chat/fetch-chat-messages",
  FETCH_CHAT_INFO: "/api/chat/fetch-chat-info",
  SUBMIT_ANSWERS: "/api/chat/submit-answers",
  STREAM: "/api/chat/stream",
} as const;

const clampLimit = (value: number | undefined, fallback: number): number => {
  if (value === undefined) return fallback;
  if (!Number.isFinite(value)) return fallback;
  return Math.min(Math.max(Math.floor(value), 1), 50);
};

export class ChatClient implements ChatClientContract {
  constructor(
    private readonly httpClient: HttpClient = new FetchUtilHttpClient(),
  ) {}

  async createNewChat(params: CreateNewChatParams): Promise<{ id: string }> {
    const prompt = ensureNonEmptyString(params.prompt, "prompt");

    return this.execute(
      "createNewChat",
      CHAT_ENDPOINTS.CREATE_NEW_CHAT,
      async () => {
        const data = await this.httpClient.post<{ id: string }>(
          CHAT_ENDPOINTS.CREATE_NEW_CHAT,
          {
            prompt,
            convId: params.convId,
          },
        );

        ensureNonEmptyString(data.id, "chat id");
        return data;
      },
    );
  }

  async fetchUserChats(
    params: FetchChatsParams = {},
  ): Promise<FetchChatsResult> {
    const url = buildUrl(CHAT_ENDPOINTS.FETCH_USER_CHATS, {
      limit: clampLimit(params.limit, 10),
      cursor: params.cursor,
    });

    return this.execute(
      "fetchUserChats",
      CHAT_ENDPOINTS.FETCH_USER_CHATS,
      async () => {
        const data = await this.httpClient.get<{
          chats: Chat[];
          nextCursor: string | null;
        }>(url);

        return {
          chats: data?.chats ?? [],
          nextCursor: data?.nextCursor ?? null,
        };
      },
    );
  }

  async fetchChatMessages(
    params: FetchChatMessagesParams,
  ): Promise<FetchMessagesResult> {
    const chatId = ensureNonEmptyString(params.chatId, "chatId");

    const url = buildUrl(CHAT_ENDPOINTS.FETCH_CHAT_MESSAGES, {
      chatId,
      limit: clampLimit(params.limit, 6),
      cursor: params.cursor,
    });

    return this.execute(
      "fetchChatMessages",
      CHAT_ENDPOINTS.FETCH_CHAT_MESSAGES,
      async () => {
        const data = await this.httpClient.get<FetchMessagesResult>(url);
        return {
          messages: data?.messages ?? [],
          nextCursor: data?.nextCursor ?? null,
        };
      },
    );
  }

  async fetchChatInfo(chatId: string): Promise<FetchChatInfoResult> {
    const validChatId = ensureNonEmptyString(chatId, "chatId");

    const url = buildUrl(CHAT_ENDPOINTS.FETCH_CHAT_INFO, {
      chatId: validChatId,
    });

    return this.execute(
      "fetchChatInfo",
      CHAT_ENDPOINTS.FETCH_CHAT_INFO,
      async () => {
        const data = await this.httpClient.get<FetchChatInfoResult>(url);
        return {
          questionAnswers: data?.questionAnswers ?? [],
          plans: data?.plans ?? [],
          siteUrl: data?.siteUrl ?? "",
          previewUrl: data?.previewUrl ?? "",
          isGenerating: data?.isGenerating ?? false,
        };
      },
    );
  }

  async submitAnswers(
    params: SubmitAnswersParams,
  ): Promise<SubmitAnswersResult> {
    const chatId = ensureNonEmptyString(params.chatId, "chatId");

    if (!Array.isArray(params.answers)) {
      throw new ChatClientError({
        message: "Missing or invalid answers",
        endpoint: CHAT_ENDPOINTS.SUBMIT_ANSWERS,
        operation: "submitAnswers",
      });
    }

    return this.execute("submitAnswers", CHAT_ENDPOINTS.SUBMIT_ANSWERS, async () => {
      const payload = await this.streamPostRequest(
        CHAT_ENDPOINTS.SUBMIT_ANSWERS,
        {
          chatId,
          answers: params.answers,
          questionSetId: params.questionSetId?.trim() || undefined,
        },
        params.onChunk,
        params.signal,
      );

      const agentMessageId = payload.agentMessageId;
      const questionSetId = payload.questionSetId ?? "";
      const status = payload.status ?? "skipped";
      const response = payload.response;
      const toolCall = payload.toolCall ?? null;

      ensureNonEmptyString(agentMessageId, "agentMessageId");
      ensureNonEmptyString(questionSetId, "questionSetId");

      return {
        response,
        toolCall,
        status,
        questionSetId,
        agentMessageId,
      };
    });
  }

  async streamChat(params: StreamChatParams): Promise<StreamChatResult> {
    const chatId = ensureNonEmptyString(params.chatId, "chatId");
    const message = ensureNonEmptyString(params.message, "message");

    return this.execute("streamChat", CHAT_ENDPOINTS.STREAM, async () => {
      const payload = await this.streamPostRequest(
        CHAT_ENDPOINTS.STREAM,
        { chatId, message },
        params.onChunk,
        params.signal,
      );

      const agentMessageId = payload.agentMessageId;
      const response = payload.response;
      const toolCall = payload.toolCall ?? null;

      return {
        agentMessageId,
        response,
        toolCall,
      };
    });
  }

  private async streamPostRequest(
    endpoint: string,
    body: Record<string, any>,
    onChunk?: (textDelta: string) => void,
    signal?: AbortSignal,
  ): Promise<{
    agentMessageId: string;
    response: string;
    toolCall: ToolCall | null;
    status?: QuestionStatus;
    questionSetId?: string;
  }> {
    const reader = await fetchStreamUtil(endpoint, {
      method: "POST",
      body: JSON.stringify(body),
      signal,
    });

    const decoder = new TextDecoder("utf-8");
    let buffer = "";
    let responseText = "";
    let donePayload: any = null;

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed) continue;

          if (trimmed.startsWith("data: ")) {
            const dataStr = trimmed.slice(6);
            try {
              const parsed = JSON.parse(dataStr);
              if (parsed.type === "text" && parsed.delta) {
                responseText += parsed.delta;
                onChunk?.(parsed.delta);
              } else if (parsed.type === "done") {
                donePayload = parsed;
              } else if (parsed.type === "error") {
                throw new Error(parsed.message || "Streaming error occurred");
              }
            } catch (e) {
              console.error("Failed to parse SSE line:", line, e);
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }

    if (!donePayload) {
      throw new Error("Stream closed without completing successfully");
    }

    return {
      ...donePayload,
      response: donePayload.response || responseText,
    };
  }

  private async execute<T>(
    operation: string,
    endpoint: string,
    task: () => Promise<T>,
  ): Promise<T> {
    try {
      return await task();
    } catch (error) {
      if (error instanceof ChatClientError) {
        throw error;
      }

      throw new ChatClientError({
        message: toClientErrorMessage(
          error,
          "Unexpected error occurred while calling chat API.",
        ),
        endpoint,
        operation,
        cause: error,
      });
    }
  }
}

export const chatClient: ChatClientContract = new ChatClient();
