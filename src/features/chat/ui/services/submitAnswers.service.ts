import {
  ChatClientContract,
  SubmitAnswersParams,
  SubmitAnswersResult,
  chatClient,
} from "../api/chat.client";
import { ChatUiServiceError, ensureNonEmptyString, toErrorMessage } from "./chatService.shared";

export interface SubmitAnswersService {
  run(params: SubmitAnswersParams): Promise<SubmitAnswersResult>;
}

interface SubmitAnswersDeps {
  client: Pick<ChatClientContract, "submitAnswers">;
}

const DEFAULT_DEPS: SubmitAnswersDeps = {
  client: chatClient,
};

class SubmitAnswersServiceImpl implements SubmitAnswersService {
  constructor(private readonly deps: SubmitAnswersDeps = DEFAULT_DEPS) {}

  async run(params: SubmitAnswersParams): Promise<SubmitAnswersResult> {
    const chatId = ensureNonEmptyString(params.chatId, "chatId");

    if (!Array.isArray(params.answers)) {
      throw new ChatUiServiceError({
        service: "submitAnswers",
        message: "Missing or invalid answers.",
      });
    }

    try {
      return await this.deps.client.submitAnswers({
        chatId,
        answers: params.answers,
        questionSetId: params.questionSetId?.trim() || undefined,
      });
    } catch (error) {
      throw new ChatUiServiceError({
        service: "submitAnswers",
        message: toErrorMessage(error, "Failed to submit answers."),
        cause: error,
      });
    }
  }
}

export const createSubmitAnswersService = (
  deps?: SubmitAnswersDeps,
): SubmitAnswersService => new SubmitAnswersServiceImpl(deps);

export const submitAnswersService = createSubmitAnswersService();

export const submitAnswers = (
  params: SubmitAnswersParams,
): Promise<SubmitAnswersResult> => submitAnswersService.run(params);
