import { getHandler } from "@/lib/apiHandler";
import { supabaseServer } from "@/lib/supabase-server";

export const GET = getHandler(async ({ query, token }) => {
  const org_id = query.get("org_id");
  const supabase = supabaseServer(token);

  if (!org_id) {
    throw new Error("Missing organization ID (org_id)");
  }

  const { data: orgProjects, error } = await supabase.rpc("get_org_projects", {
    p_org_id: org_id,
  });

  if (error) {
    console.error("Supabase get_org_projects error:", error.message);
    throw new Error("Failed to fetch organization projects");
  }

  return orgProjects ?? [];
});
