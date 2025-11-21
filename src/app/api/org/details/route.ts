import { supabase } from "@/lib/supabase-client";
import { getHandler } from "@/lib/apiHandler";

export const GET = getHandler(async ({ userId, query }) => {
  const org_id = query.get("org_id");
  const { data: org_details, error } = await supabase.rpc(
    "get_org_details_with_access",
    {
      org_id: org_id,
      user_id: userId,
    }
  );

  if (error) {
    console.error("Supabase get_user_organizations error:", error.message);
    throw new Error("Failed to fetch organization details");
  }

  return org_details || [];
});
