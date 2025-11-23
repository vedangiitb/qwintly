import { getHandler } from "@/lib/apiHandler";
import { supabaseServer } from "@/lib/supabase-server";

export const GET = getHandler(async ({ query, token }) => {
  const chatId = query.get("chatId");
  if (!chatId) throw new Error("Missing chatId");

  const supabase = supabaseServer(token);

  const { data: data, error } = await supabase.rpc("fetch_chat_messages", {
    p_chat_id: chatId,
  });

  console.log(data,error);

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
    },
    messages: messages ?? [],
  };
});
