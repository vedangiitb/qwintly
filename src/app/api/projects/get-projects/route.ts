import { supabase } from "@/lib/supabaseClient";
import { getHandler } from "@/lib/apiHandler";

export const GET = getHandler(async ({ userId }) => {
  const { data: projects, error } = await supabase.rpc("get_user_projects", {
    p_user_id: userId,
  });

  if (error) {
    console.error("Supabase get_user_projects error:", error.message);
    throw new Error("Failed to fetch projects");
  }

  return projects ?? [];
});
