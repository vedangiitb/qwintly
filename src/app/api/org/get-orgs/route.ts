import { getHandler } from "@/lib/apiHandler";
import { createClient } from "@supabase/supabase-js";

export const GET = getHandler(async ({ userId, token }) => {
  // Create supabase client WITH USER JWT for RLS
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

  const { data: orgs, error } = await supabase.rpc("get_user_organizations", {
    userid: userId,
  });

  if (error) {
    console.error("Supabase RPC error:", error.message);
    throw new Error("Failed to fetch organizations");
  }

  return orgs ?? [];
});
