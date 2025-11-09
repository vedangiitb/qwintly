import { supabase } from "@/lib/supabaseClient";
import { getHandler } from "@/lib/apiHandler";

export const GET = getHandler(async ({ userId, query }) => {
  const chatId = query.get("chatId");
  if (!chatId) throw new Error("Missing chatId");

  // --- Verify chat ownership ---
  const { data: chat, error: chatError } = await supabase
    .from("chats")
    .select("id, user_id, title, created_at, updated_at")
    .eq("id", chatId)
    .limit(1)
    .single();

  if (chatError || !chat) {
    console.error("Supabase chat lookup error:", chatError?.message);
    throw new Error("Chat not found");
  }

  if (chat.user_id !== userId) {
    throw new Error("Forbidden");
  }

  // --- Fetch messages ---
  const { data: messages, error: messageError } = await supabase
    .from("messages")
    .select("id, role, content, created_at, token_count")
    .eq("conv_id", chatId)
    .eq("user_id", userId)
    .order("created_at", { ascending: true });

  if (messageError) {
    console.error("Supabase message fetch error:", messageError.message);
    throw new Error("Failed to fetch messages");
  }

  // --- Update last accessed timestamp (non-blocking) ---
  supabase
    .from("chats")
    .update({ updated_at: new Date().toISOString() })
    .eq("id", chatId)
    .then(({ error }) => {
      if (error)
        console.warn("Failed updating chat updated_at:", error.message);
    });

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
