import { postHandler } from "@/lib/apiHandler";
import { supabaseServer } from "@/lib/supabase-server";

export const POST = postHandler(async ({ body,token }) => {
  const { project_name, project_type, org_id } = body;
  const supabase = supabaseServer(token);

  if (!project_name || !project_type || !org_id) {
    throw new Error(
      "Missing or invalid fields: project_name, project_type, or org_id"
    );
  }

  const { data, error } = await supabase.rpc("create_project_with_member", {
    p_name: project_name,
    p_type: project_type,
    p_org_id: org_id,
  });

  if (error) {
    console.error("Supabase create_project_with_member error:", error);
    throw new Error(error.message || "Failed to create project");
  }

  const project = data?.[0] ?? {};
  return { id: project.project_id ?? null, ...project };
});
