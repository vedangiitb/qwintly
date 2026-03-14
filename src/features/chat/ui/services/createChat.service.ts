import { ChatClientContract, chatClient } from "../api/chat.client";
import { ChatUiServiceError, ensureNonEmptyString, toErrorMessage } from "./chatService.shared";

export interface CreateChatParams {
  prompt: string;
  convId?: string;
}

export interface CreateChatService {
  run(params: CreateChatParams): Promise<{ chatId: string }>;
}

interface CreateChatDeps {
  client: Pick<ChatClientContract, "createNewChat">;
}

const DEFAULT_DEPS: CreateChatDeps = {
  client: chatClient,
};

class CreateChatServiceImpl implements CreateChatService {
  constructor(private readonly deps: CreateChatDeps = DEFAULT_DEPS) {}

  async run(params: CreateChatParams): Promise<{ chatId: string }> {
    const prompt = ensureNonEmptyString(params.prompt, "prompt");

    try {
      const response = await this.deps.client.createNewChat({
        prompt,
        convId: params.convId?.trim() || undefined,
      });

      const chatId = ensureNonEmptyString(response.id, "chatId");

      return { chatId };
    } catch (error) {
      throw new ChatUiServiceError({
        service: "createChat",
        message: toErrorMessage(error, "Failed to create chat."),
        cause: error,
      });
    }
  }
}

export const createCreateChatService = (
  deps?: CreateChatDeps,
): CreateChatService => new CreateChatServiceImpl(deps);

export const createChatService = createCreateChatService();

export const createChat = (params: CreateChatParams): Promise<{ chatId: string }> =>
  createChatService.run(params);
