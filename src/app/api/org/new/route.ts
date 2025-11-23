import { postHandler } from "@/lib/apiHandler";
import { supabaseServer } from "@/lib/supabase-server";

export const POST = postHandler(async ({ body, token }) => {
  const { org_name } = body;

  const supabase = supabaseServer(token);
  
  if (!org_name) {
    throw new Error("Missing or invalid organization name");
  }

  const { data, error } = await supabase.rpc(
    "create_organization_with_member",
    {
      p_org_name: org_name,
    }
  );

  if (error) {
    console.error("Supabase RPC error:", error);
    throw new Error(error.message || "Failed to create organization");
  }

  const org = data?.[0] ?? {};
  return { id: org.org_id ?? null, ...org };
});
