import { supabase } from "@/lib/supabase-client";
import { postHandler } from "@/lib/apiHandler";

export const POST = postHandler(async ({ userId, body }) => {
  const { message, chatId } = body;

  // Validate input
  if (!message?.content || !chatId) {
    throw new Error("Missing message content or chatId");
  }

  // Insert message into Supabase
  const { data, error } = await supabase
    .from("messages")
    .insert([
      {
        conv_id: chatId,
        user_id: userId,
        role: message.role || "user",
        content: message.content,
        token_count: message.token_count ?? 0,
        created_at: new Date().toISOString(),
      },
    ])
    .select()
    .single();

  if (error) {
    console.error("Supabase insert error:", error);
    throw new Error(error.message || "Failed to insert message");
  }

  // Return structured response
  return data;
});
