import { createClient } from "@supabase/supabase-js";

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  // 🚨 Build-time safe: do not throw
  if (!url || !serviceRoleKey) {
    return null;
  }

  const supabaseAdmin = createClient(url, serviceRoleKey);

  return supabaseAdmin;
}

export const supabaseAdmin = getSupabaseAdmin();
