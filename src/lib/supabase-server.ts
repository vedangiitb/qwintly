// supabase-server.ts
import { createClient } from "@supabase/supabase-js";

export const supabaseServer = (token: string) => {
  const supabaseKey =
    // process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !supabaseKey
  ) {
    throw new Error("Missing Supabase credentials");
  }

  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    supabaseKey,
    {
      global: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    },
  );
};
