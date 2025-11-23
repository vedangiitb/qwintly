import { getHandler } from "@/lib/apiHandler";
import { supabaseServer } from "@/lib/supabase-server";

export const GET = getHandler(async ({ token }) => {
  const supabase = supabaseServer(token);
  const { data: projects, error } = await supabase.rpc("get_user_projects");

  if (error) {
    console.error("Supabase get_user_projects error:", error.message);
    throw new Error("Failed to fetch projects");
  }

  return projects ?? [];
});
