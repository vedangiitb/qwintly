import { submitAnswers } from "@/features/chat/server/services/submitAnswers.service";
import { streamHandler, ApiResponse } from "@/lib/apiHandler";
import { verifyToken } from "@/lib/verifyToken";

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

  const encoder = new TextEncoder();

  const customReadable = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of stream) {
          if (chunk.type === "text" && chunk.content) {
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({
                  type: "text",
                  delta: chunk.content,
                })}\n\n`
              )
            );
          } else if (chunk.type === "done") {
            const payload = {
              type: "done",
              agentMessageId: chunk.agentMessageId,
              response: chunk.fullText,
              toolCall: chunk.toolCalls?.[0] ?? null,
              status,
              questionSetId: resolvedQuestionSetId,
            };
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify(payload)}\n\n`)
            );
          }
        }
      } catch (error) {
        console.error("Streaming error in customReadable:", error);
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({
              type: "error",
              message: error instanceof Error ? error.message : String(error),
            })}\n\n`
          )
        );
      } finally {
        controller.close();
      }
    },
  });

  return {
    _sse: true,
    response: ApiResponse.stream(customReadable),
  };
});
