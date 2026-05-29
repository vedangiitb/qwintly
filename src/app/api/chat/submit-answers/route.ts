import { submitAnswers } from "@/features/chat/server/services/submitAnswers.service";
import { streamHandler } from "@/lib/apiHandler";
import { verifyToken } from "@/lib/verifyToken";
import { createChatSseResponse } from "@/features/chat/server/helpers/createChatSseResponse";

export const POST = streamHandler(async ({ token, body }) => {
  const { chatId, answers, questionSetId } = body ?? {};

  if (!chatId || typeof chatId !== "string" || !chatId.trim()) {
    throw new Error("Missing or invalid chatId");
  }

  if (!Array.isArray(answers)) {
    throw new Error("Missing or invalid answers");
  }

  if (
    questionSetId !== undefined &&
    (typeof questionSetId !== "string" || !questionSetId.trim())
  ) {
    throw new Error("Invalid questionSetId");
  }

  await verifyToken(token);

  const {
    stream,
    status,
    questionSetId: resolvedQuestionSetId,
  } = await submitAnswers(
    {
      chatId,
      answers,
      questionSetId,
    },
    token,
  );

  return createChatSseResponse({
    stream,
    buildDonePayload: (chunk) => ({
      agentMessageId: chunk.agentMessageId,
      response: chunk.fullText,
      toolCall: chunk.toolCalls?.[0] ?? null,
      status,
      questionSetId: resolvedQuestionSetId,
    }),
  });
});
