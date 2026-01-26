import { postHandler } from "@/lib/apiHandler";
import { supabaseServer } from "@/lib/supabase-server";

export const POST = postHandler(async ({ token, body }) => {
  const { message, chatId } = body;

  const supabase = supabaseServer(token);

  // Validate input
  if (!message?.content || !chatId) {
    throw new Error("Missing message content or chatId");
  }

  // Insert message into Supabase
  const { data, error } = await supabase.rpc("insert_message", {
    p_chat_id: chatId,
    p_role: message.role,
    p_content: message.content,
    p_token_count: 0,
    p_msg_type: message.msgType,
    p_stage: message.stage,
  });

  if (error) {
    console.error("Supabase insert error:", error);
    throw new Error(error.message || "Failed to insert message");
  }

  // Return structured response
  return data;
});
