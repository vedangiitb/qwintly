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
}

export interface StreamChatParams {
  chatId: string;
  message: string;
  signal?: AbortSignal;
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
      limit: clampLimit(params.limit, 20),
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

    return this.execute(
      "submitAnswers",
      CHAT_ENDPOINTS.SUBMIT_ANSWERS,
      async () => {
        const data = await this.httpClient.post<SubmitAnswersResult>(
          CHAT_ENDPOINTS.SUBMIT_ANSWERS,
          {
            chatId,
            answers: params.answers,
            questionSetId: params.questionSetId?.trim(),
          },
        );

        const response = ensureNonEmptyString(data.response, "response");
        const questionSetId = ensureNonEmptyString(
          data.questionSetId,
          "questionSetId",
        );
        const agentMessageId = ensureNonEmptyString(
          data.agentMessageId,
          "agentMessageId",
        );

        return {
          response,
          toolCall: data.toolCall ?? null,
          status: data.status,
          questionSetId,
          agentMessageId,
        };
      },
    );
  }

  async streamChat(params: StreamChatParams): Promise<StreamChatResult> {
    const chatId = ensureNonEmptyString(params.chatId, "chatId");
    const message = ensureNonEmptyString(params.message, "message");

    return this.execute("streamChat", CHAT_ENDPOINTS.STREAM, async () => {
      const data = await this.httpClient.post<{
        agentMessageId: string;
        response: string;
        toolCall: ToolCall | null;
      }>(
        CHAT_ENDPOINTS.STREAM,
        {
          chatId,
          message,
        },
        params.signal,
      );

      const response = ensureNonEmptyString(data.response, "response");

      return {
        agentMessageId: data.agentMessageId,
        response,
        toolCall: data.toolCall ?? null,
      };
    });
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
