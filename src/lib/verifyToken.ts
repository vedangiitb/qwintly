import { createClient } from "@supabase/supabase-js";

export async function verifyToken(token: string) {
  const supabaseKey =
    // process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !supabaseKey
  ) {
    throw new Error("Missing Supabase credentials");
  }

  const supabase = createClient(
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

  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    throw new Error(error.message);
  }

  return data.user.id;
}
