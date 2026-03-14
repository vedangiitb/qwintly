import { ChatClientContract, FetchChatInfoResult, chatClient } from "../api/chat.client";
import { ChatUiServiceError, ensureNonEmptyString, toErrorMessage } from "./chatService.shared";

export interface FetchChatInfoService {
  run(chatId: string): Promise<FetchChatInfoResult>;
}

interface FetchChatInfoDeps {
  client: Pick<ChatClientContract, "fetchChatInfo">;
}

const DEFAULT_DEPS: FetchChatInfoDeps = {
  client: chatClient,
};

class FetchChatInfoServiceImpl implements FetchChatInfoService {
  constructor(private readonly deps: FetchChatInfoDeps = DEFAULT_DEPS) {}

  async run(chatId: string): Promise<FetchChatInfoResult> {
    const validChatId = ensureNonEmptyString(chatId, "chatId");

    try {
      return await this.deps.client.fetchChatInfo(validChatId);
    } catch (error) {
      throw new ChatUiServiceError({
        service: "fetchChatInfo",
        message: toErrorMessage(error, "Failed to fetch chat info."),
        cause: error,
      });
    }
  }
}

export const createFetchChatInfoService = (
  deps?: FetchChatInfoDeps,
): FetchChatInfoService => new FetchChatInfoServiceImpl(deps);

export const fetchChatInfoService = createFetchChatInfoService();

export const fetchChatInfo = (chatId: string): Promise<FetchChatInfoResult> =>
  fetchChatInfoService.run(chatId);
