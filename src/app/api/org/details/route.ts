import { getHandler } from "@/lib/apiHandler";
import { supabaseServer } from "@/lib/supabase-server";

export const GET = getHandler(async ({ query, token }) => {
  const org_id = query.get("org_id");
  const supabase = supabaseServer(token);
  
  const { data: org_details, error } = await supabase.rpc(
    "get_org_details_with_access",
    {
      org_id: org_id,
    }
  );

  if (error) {
    console.error("Supabase get_user_organizations error:", error.message);
    throw new Error("Failed to fetch organization details");
  }

  return org_details || [];
});
