import { fetchUserChats } from "@/features/chat/server/services/fetchUserChats.service";
import { getHandler } from "@/lib/apiHandler";
import { verifyToken } from "@/lib/verifyToken";

export const GET = getHandler(async ({ query, token }) => {
  const rawLimit = parseInt(query.get("limit") ?? "10", 10);
  const limit = Number.isNaN(rawLimit) ? 10 : Math.min(Math.max(rawLimit, 1), 50);
  const cursor = query.get("cursor") ?? undefined;

  await verifyToken(token);

  const { chats, nextCursor } = await fetchUserChats(
    { limit, cursor },
    token,
  );

  return {
    chats,
    nextCursor,
  };
});
