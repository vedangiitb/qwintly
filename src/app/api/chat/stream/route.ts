import { buildWebsiteAgent } from "@/features/ai/factories/buildWebsiteAgent";
import { MessagesRepository } from "@/features/chat/server/repositories/messages.repository";
import { checkUserMessageLimit } from "@/features/chat/server/services/rateLimit.service";
import { persistMessage } from "@/features/chat/server/services/persistMessage.service";
import { ROLES } from "@/features/chat/types/messages.types";
import { streamHandler, ApiResponse } from "@/lib/apiHandler";
import { verifyToken } from "@/lib/verifyToken";

export const POST = streamHandler(async ({ body, token }) => {
  const { chatId, message: userMessage } = body;

  const userId = await verifyToken(token);

  const messageRepo = new MessagesRepository(token);
  const aiAgent = buildWebsiteAgent(token);

  // 1. Check daily limit
  await checkUserMessageLimit(userId);

  // 2. Persist user message
  const userMessageId = await persistMessage({
    chatId,
    content: userMessage,
    role: ROLES.USER,
    repo: messageRepo,
  });

  const encoder = new TextEncoder();

  const customReadable = new ReadableStream({
    async start(controller) {
      try {
        const stream = aiAgent.streamAgentFlow(
          chatId,
          userMessage,
          userMessageId,
        );

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
