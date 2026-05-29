import { streamChat } from "@/features/chat/server/services/streamChat.service";
import { streamHandler } from "@/lib/apiHandler";
import { verifyToken } from "@/lib/verifyToken";

export const POST = streamHandler(async ({ body, token }) => {
  const { chatId, message: userMessage } = body;
  const userId = await verifyToken(token);

  return streamChat(chatId, userMessage, token, userId);
});
