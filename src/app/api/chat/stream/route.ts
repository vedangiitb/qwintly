import { buildWebsiteAgent } from "@/features/ai/factories/buildWebsiteAgent";
import { MessagesRepository } from "@/features/chat/server/repositories/messages.repository";
import { streamChatService } from "@/features/chat/server/services/streamChatService";
import { postHandler } from "@/lib/apiHandler";
import { verifyToken } from "@/lib/verifyToken";

export const POST = postHandler(async ({ body, token }) => {
  const { chatId, message } = body;

  await verifyToken(token);

  const messageRepo = new MessagesRepository(token);
  const aiAgent = buildWebsiteAgent(token);

  const { agentMessageId, response, toolCall } = await streamChatService({
    chatId,
    userMessage: message,
    messageRepo,
    aiAgent,
  });

  return { agentMessageId, response, toolCall };
});
