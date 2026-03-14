import { buildWebsiteAgent } from "@/features/ai/factories/buildWebsiteAgent";
import { AskQuestionsRepository } from "@/features/ai/repository/askQuestions.repository";
import {
  QUESTION_STATUS,
  QuestionAnswers,
  QuestionStatus,
  UserResponse,
} from "../../../ai/types/askQuestions.types";
import { ToolCall } from "../../../ai/types/tools.types";
import { MESSAGE_TYPES, ROLES } from "../../types/messages.types";
import { validateChatId } from "../helpers/validateChatId";
import { MessagesRepository } from "../repositories/messages.repository";
import { persistMessage } from "./persistMessage.service";

interface SubmitAnswersDeps {
  askQuestionsRepo: Pick<
    AskQuestionsRepository,
    "fetchQuestionsByChatId" | "updateUserResponses"
  >;
  messagesRepo: MessagesRepository;
  aiAgent: {
    runAgentFlow: (
      chatId: string,
      userMessage: string,
      userMessageId: string,
    ) => Promise<{
      aiResponse: string;
      uiToolResponse: ToolCall | null;
      agentMessageId: string;
    }>;
  };
}

interface SubmitAnswersResult {
  response: string;
  toolCall: ToolCall | null;
  questionSetId: string;
  status: QuestionStatus;
  agentMessageId: string;
}

const createSubmitAnswersDeps = (token: string): SubmitAnswersDeps => ({
  askQuestionsRepo: new AskQuestionsRepository(token),
  messagesRepo: new MessagesRepository(token),
  aiAgent: buildWebsiteAgent(token),
});

const validateAnswers = (answers: unknown): UserResponse[] => {
  if (!Array.isArray(answers)) {
    throw new Error("Invalid answers payload");
  }

  answers.forEach((answer, index) => {
    if (!answer || typeof answer !== "object") {
      throw new Error(`Invalid answer at index ${index}`);
    }

    const castAnswer = answer as UserResponse;
    if (!castAnswer.questionId?.trim()) {
      throw new Error(`Missing questionId at index ${index}`);
    }

    const response = castAnswer.response;
    const isTextResponse = typeof response === "string";
    const isListResponse =
      Array.isArray(response) &&
      response.every((item) => typeof item === "string");

    if (!isTextResponse && !isListResponse) {
      throw new Error(`Invalid response value at index ${index}`);
    }
  });

  return answers as UserResponse[];
};

const hasMeaningfulResponse = (response: UserResponse["response"]): boolean => {
  if (typeof response === "string") return response.trim().length > 0;
  return response.some((entry) => entry.trim().length > 0);
};

const resolveQuestionSetId = async (
  explicitQuestionSetId: string | undefined,
  chatId: string,
  askQuestionsRepo: SubmitAnswersDeps["askQuestionsRepo"],
): Promise<string> => {
  if (explicitQuestionSetId?.trim()) return explicitQuestionSetId.trim();

  const questionSets = await askQuestionsRepo.fetchQuestionsByChatId(chatId);

  if (!questionSets.length) {
    throw new Error("No question set found for this chat");
  }

  const pendingSet = questionSets.find((set: QuestionAnswers) => {
    const responses = Array.isArray(set.userResponses) ? set.userResponses : [];
    return responses.length === 0;
  });

  return (pendingSet ?? questionSets[0]).id;
};

export const submitAnswers = async (
  {
    chatId,
    answers,
    questionSetId,
  }: {
    chatId: string;
    answers: UserResponse[];
    questionSetId?: string;
  },
  token: string,
  deps: SubmitAnswersDeps = createSubmitAnswersDeps(token),
): Promise<SubmitAnswersResult> => {
  const validChatId = validateChatId(chatId);
  const validAnswers = validateAnswers(answers);

  const resolvedQuestionSetId = await resolveQuestionSetId(
    questionSetId,
    validChatId,
    deps.askQuestionsRepo,
  );

  const status = validAnswers.some((answer) =>
    hasMeaningfulResponse(answer.response),
  )
    ? QUESTION_STATUS.ANSWERED
    : QUESTION_STATUS.SKIPPED;

  await deps.askQuestionsRepo.updateUserResponses(
    resolvedQuestionSetId,
    validAnswers,
    status,
  );

  const userMessage = `User submitted questionnaire answers for question set ${resolvedQuestionSetId}: ${JSON.stringify(validAnswers)}`;

  const userMessageId = await persistMessage({
    chatId,
    content: userMessage,
    role: ROLES.USER,
    repo: deps.messagesRepo,
    type: MESSAGE_TYPES.QUESTIONS,
  });

  const { aiResponse, uiToolResponse, agentMessageId } =
    await deps.aiAgent.runAgentFlow(validChatId, userMessage, userMessageId);

  if (!aiResponse && !uiToolResponse) {
    throw new Error("AI returned empty response");
  }

  return {
    response: aiResponse,
    toolCall: uiToolResponse ?? null,
    questionSetId: resolvedQuestionSetId,
    status,
    agentMessageId,
  };
};
