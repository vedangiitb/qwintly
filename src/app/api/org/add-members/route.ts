import { postHandler } from "@/lib/apiHandler";
import { supabaseServer } from "@/lib/supabase-server";

export const POST = postHandler(async ({ body, token }) => {
  const { org_id, member_id, role } = body;
  const supabase = supabaseServer(token);

  if (!org_id || !member_id || !role) {
    throw new Error("Missing required fields: org_id, member_id, or role");
  }

  const { data, error } = await supabase.rpc("add_org_member", {
    p_org_id: org_id,
    p_member_id: member_id,
    p_role: role,
  });

  if (error) {
    console.error("Supabase RPC error:", error);
    throw new Error(error.message || "Failed to add organization member");
  }

  return data;
});
