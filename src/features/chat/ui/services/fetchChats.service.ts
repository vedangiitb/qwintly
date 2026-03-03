import { ChatClientContract, FetchChatsParams, chatClient } from "../api/chat.client";
import { FetchChatsResult } from "../../types/chat.types";
import { ChatUiServiceError, toErrorMessage } from "./chatService.shared";

export interface FetchChatsService {
  run(params?: FetchChatsParams): Promise<FetchChatsResult>;
}

interface FetchChatsDeps {
  client: Pick<ChatClientContract, "fetchUserChats">;
}

const DEFAULT_DEPS: FetchChatsDeps = {
  client: chatClient,
};

class FetchChatsServiceImpl implements FetchChatsService {
  constructor(private readonly deps: FetchChatsDeps = DEFAULT_DEPS) {}

  async run(params: FetchChatsParams = {}): Promise<FetchChatsResult> {
    try {
      return await this.deps.client.fetchUserChats({
        limit: params.limit,
        cursor: params.cursor?.trim() || undefined,
      });
    } catch (error) {
      throw new ChatUiServiceError({
        service: "fetchChats",
        message: toErrorMessage(error, "Failed to fetch chats."),
        cause: error,
      });
    }
  }
}

export const createFetchChatsService = (
  deps?: FetchChatsDeps,
): FetchChatsService => new FetchChatsServiceImpl(deps);

export const fetchChatsService = createFetchChatsService();

export const fetchChats = (params?: FetchChatsParams): Promise<FetchChatsResult> =>
  fetchChatsService.run(params);
