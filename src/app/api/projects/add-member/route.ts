import { supabase } from "@/lib/supabaseClient";
import { postHandler } from "@/lib/apiHandler";

export const POST = postHandler(async ({ userId, body }) => {
  const { project_id, member_id, role } = body;

  if (!project_id || !member_id || !role) {
    throw new Error("Missing required fields: project_id, member_id, or role");
  }

  const { data, error } = await supabase.rpc("add_project_member", {
    p_project_id: project_id,
    p_requester_id: userId,
    p_new_member_id: member_id,
    p_role: role,
  });

  if (error) {
    console.error("Supabase RPC error:", error);
    throw new Error(error.message || "Failed to add project member");
  }

  return data;
});
