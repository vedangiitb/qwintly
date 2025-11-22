import { postHandler } from "@/lib/apiHandler";
import { createClient } from "@supabase/supabase-js";

export const POST = postHandler(async ({ userId, body, token }) => {
  const { org_name } = body;

  const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      }
    );

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
