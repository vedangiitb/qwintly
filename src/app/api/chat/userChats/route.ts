import { getHandler } from "@/lib/apiHandler";
import { supabaseServer } from "@/lib/supabase-server";

export const GET = getHandler(async ({ token }) => {
  const supabase = supabaseServer(token);
  const { data: chats, error } = await supabase.rpc("fetch_user_all_chats");

  if (error) {
    console.error("Supabase chat lookup error:", error.message);
    throw new Error("Failed to fetch chats");
  }

  return chats ?? [];
});
