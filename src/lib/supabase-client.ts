import { createClient } from "@supabase/supabase-js";

export function getSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey =
    // process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  // ✅ Build-time safe: do NOT throw
  if (!url || !anonKey) {
    return null;
  }

  const supabase = createClient(url, anonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      // Disable LockManager to avoid browser lock acquisition timeouts in nested iframes/dev server setups
      lock: async (name, acquireTimeout, fn) => {
        return fn();
      },
    },
  });

  return supabase;
}

export const supabase = getSupabaseClient();
