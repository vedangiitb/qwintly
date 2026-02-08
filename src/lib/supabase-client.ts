import { createClient } from "@supabase/supabase-js";

export function getSupabaseClient() {
  let supabase: ReturnType<typeof createClient> | null = null;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // ✅ Build-time safe: do NOT throw
  if (!url || !anonKey) {
    return null;
  }

  if (!supabase) {
    supabase = createClient(url, anonKey);
  }

  return supabase;
}

export const supabase = getSupabaseClient();
