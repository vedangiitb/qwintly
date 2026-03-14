import {
  ChatClientContract,
  FetchChatMessagesParams,
  chatClient,
} from "../api/chat.client";
import { FetchMessagesResult } from "../../types/chat.types";
import { ChatUiServiceError, ensureNonEmptyString, toErrorMessage } from "./chatService.shared";

export interface FetchChatMessagesService {
  run(params: FetchChatMessagesParams): Promise<FetchMessagesResult>;
}

interface FetchChatMessagesDeps {
  client: Pick<ChatClientContract, "fetchChatMessages">;
}

const DEFAULT_DEPS: FetchChatMessagesDeps = {
  client: chatClient,
};

class FetchChatMessagesServiceImpl implements FetchChatMessagesService {
  constructor(private readonly deps: FetchChatMessagesDeps = DEFAULT_DEPS) {}

  async run(params: FetchChatMessagesParams): Promise<FetchMessagesResult> {
    const chatId = ensureNonEmptyString(params.chatId, "chatId");

    try {
      return await this.deps.client.fetchChatMessages({
        chatId,
        limit: params.limit,
        cursor: params.cursor?.trim() || undefined,
      });
    } catch (error) {
      throw new ChatUiServiceError({
        service: "fetchChatMessages",
        message: toErrorMessage(error, "Failed to fetch chat messages."),
        cause: error,
      });
    }
  }
}

export const createFetchChatMessagesService = (
  deps?: FetchChatMessagesDeps,
): FetchChatMessagesService => new FetchChatMessagesServiceImpl(deps);

export const fetchChatMessagesService = createFetchChatMessagesService();

export const fetchChatMessages = (
  params: FetchChatMessagesParams,
): Promise<FetchMessagesResult> => fetchChatMessagesService.run(params);
