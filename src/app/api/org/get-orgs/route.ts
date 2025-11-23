import { getHandler } from "@/lib/apiHandler";
import { supabaseServer } from "@/lib/supabase-server";

export const GET = getHandler(async ({ token }) => {
  const supabase = supabaseServer(token);

  const { data: orgs, error } = await supabase.rpc("get_user_organizations");

  if (error) {
    console.error("Supabase RPC error:", error.message);
    throw new Error("Failed to fetch organizations");
  }

  return orgs ?? [];
});
