import { supabase } from "@/lib/supabaseClient";
import { getHandler } from "@/lib/apiHandler";

export const GET = getHandler(async ({ userId }) => {
  const { data: orgs, error } = await supabase.rpc("get_user_organizations", {
    userid: userId,
  });

  if (error) {
    console.error("Supabase get_user_organizations error:", error.message);
    throw new Error("Failed to fetch organizations");
  }

  return orgs || [];
});
