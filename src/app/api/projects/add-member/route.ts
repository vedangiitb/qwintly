import { supabase } from "@/lib/supabase-client";
import { postHandler } from "@/lib/apiHandler";
import { supabaseServer } from "@/lib/supabase-server";

export const POST = postHandler(async ({ body, token }) => {
  const { project_id, member_id, role } = body;

  if (!project_id || !member_id || !role) {
    throw new Error("Missing required fields: project_id, member_id, or role");
  }

  const supabase = supabaseServer(token);

  const { data, error } = await supabase.rpc("add_project_member", {
    p_project_id: project_id,
    p_new_member_id: member_id,
    p_role: role,
  });

  if (error) {
    console.error("Supabase RPC error:", error);
    throw new Error(error.message || "Failed to add project member");
  }

  return data;
});
