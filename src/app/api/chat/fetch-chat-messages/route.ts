import { fetchChatMessages } from "@/features/chat/server/services/fetchChatMessages.service";
import { getHandler } from "@/lib/apiHandler";
import { verifyToken } from "@/lib/verifyToken";

export const GET = getHandler(async ({ query, token }) => {
  const chatId = query.get("chatId");
  const rawLimit = parseInt(query.get("limit") ?? "20", 10);
  const limit = Number.isNaN(rawLimit) ? 20 : Math.min(Math.max(rawLimit, 1), 50);
  const cursor = query.get("cursor") ?? undefined;

  if (!chatId?.trim()) throw new Error("Missing or invalid chatId");

  await verifyToken(token);

  const { messages, nextCursor } = await fetchChatMessages(
    { chatId, limit, cursor },
    token,
  );

  return {
    messages,
    nextCursor,
  };
});
