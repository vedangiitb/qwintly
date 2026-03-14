import { submitAnswers } from "@/features/chat/server/services/submitAnswers.service";
import { postHandler } from "@/lib/apiHandler";
import { verifyToken } from "@/lib/verifyToken";

export const POST = postHandler(async ({ token, body }) => {
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
    response,
    toolCall,
    status,
    questionSetId: resolvedQuestionSetId,
    agentMessageId,
  } = await submitAnswers(
    {
      chatId,
      answers,
      questionSetId,
    },
    token,
  );

  return {
    response,
    toolCall,
    status,
    questionSetId: resolvedQuestionSetId,
    agentMessageId,
  };
});
