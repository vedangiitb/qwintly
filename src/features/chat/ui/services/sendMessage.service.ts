import {
  ChatClientContract,
  StreamChatParams,
  StreamChatResult,
  chatClient,
} from "../api/chat.client";
import { ChatUiServiceError, ensureNonEmptyString, toErrorMessage } from "./chatService.shared";

export interface SendMessageParams {
  chatId: string;
  message: string;
  signal?: AbortSignal;
}

export interface SendMessageService {
  run(params: SendMessageParams): Promise<StreamChatResult>;
}

interface SendMessageDeps {
  client: Pick<ChatClientContract, "streamChat">;
}

const DEFAULT_DEPS: SendMessageDeps = {
  client: chatClient,
};

class SendMessageServiceImpl implements SendMessageService {
  constructor(private readonly deps: SendMessageDeps = DEFAULT_DEPS) {}

  async run(params: SendMessageParams): Promise<StreamChatResult> {
    const chatId = ensureNonEmptyString(params.chatId, "chatId");
    const message = ensureNonEmptyString(params.message, "message");

    try {
      return await this.deps.client.streamChat({
        chatId,
        message,
        signal: params.signal,
      });
    } catch (error) {
      throw new ChatUiServiceError({
        service: "sendMessage",
        message: toErrorMessage(error, "Failed to send message."),
        cause: error,
      });
    }
  }
}

export const createSendMessageService = (
  deps?: SendMessageDeps,
): SendMessageService => new SendMessageServiceImpl(deps);

export const sendMessageService = createSendMessageService();

export const sendMessage = (params: StreamChatParams): Promise<StreamChatResult> =>
  sendMessageService.run(params);
