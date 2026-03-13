import { fetchChatInfo } from "@/features/chat/server/services/fetchChatInfo.service";
import { getHandler } from "@/lib/apiHandler";
import { verifyToken } from "@/lib/verifyToken";

export const GET = getHandler(async ({ query, token }) => {
  const chatId = query.get("chatId")?.trim();

  if (!chatId) throw new Error("Missing or invalid chatId");

  await verifyToken(token);

  const { questionAnswers, plans } = await fetchChatInfo(chatId, token);

  return {
    questionAnswers,
    plans,
  };
});
