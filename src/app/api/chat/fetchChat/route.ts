import { stages } from "@/ai/helpers/getPrompt";
import { getHandler } from "@/lib/apiHandler";
import { supabaseServer } from "@/lib/supabase-server";
import { verifyToken } from "@/lib/verifyToken";

export const GET = getHandler(async ({ query, token }) => {
  const chatId = query.get("chatId");
  if (!chatId) throw new Error("Missing chatId");

  await verifyToken(token);

  const supabase = supabaseServer(token);

  const { data: data, error } = await supabase.rpc("fetch_chat_messages", {
    p_chat_id: chatId,
  });

  const { chat, messages } = data;

  if (error) {
    console.error(error);
    throw new Error(error.message);
  }

  // --- Return structured response ---
  return {
    chat: {
      id: chat.id,
      title: chat.title ?? "Untitled Chat",
      createdAt: chat.created_at ?? null,
      updatedAt: chat.updated_at ?? null,
      stage: chat.stage ?? stages.INIT,
    },
    messages: messages ?? [],
  };
});
