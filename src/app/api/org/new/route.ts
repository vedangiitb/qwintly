import { postHandler } from "@/lib/apiHandler";
import { supabase } from "@/lib/supabaseClient";

export const POST = postHandler(async ({ userId, body }) => {
  const { org_name } = body;

  if (!org_name) {
    throw new Error("Missing or invalid organization name");
  }

  const { data, error } = await supabase.rpc(
    "create_organization_with_member",
    {
      p_org_name: org_name,
      p_user_id: userId,
    }
  );

  if (error) {
    console.error("Supabase RPC error:", error);
    throw new Error(error.message || "Failed to create organization");
  }

  const org = data?.[0] ?? {};
  return { id: org.org_id ?? null, ...org };
});
