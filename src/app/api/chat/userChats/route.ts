import { supabase } from "@/lib/supabase-client";
import { getHandler } from "@/lib/apiHandler";

export const GET = getHandler(async ({ userId }) => {
  // ✅ Fetch all chats for this user
  const { data: chats, error } = await supabase
    .from("chats")
    .select("id, title, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  // ✅ Handle Supabase error
  if (error) {
    console.error("Supabase chat lookup error:", error.message);
    throw new Error("Failed to fetch chats");
  }

  // ✅ Return the chat list
  return chats ?? [];
});
