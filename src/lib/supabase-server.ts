// supabase-server.ts
import { createServerClient } from "@supabase/ssr";

export function supabaseServer(cookieStore: {
  get: (name: string) => string | undefined;
}) {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: cookieStore.get,
        set() {},
        remove() {},
      },
    }
  );
}
