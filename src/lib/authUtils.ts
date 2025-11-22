// authUtils.ts
import { createClient } from "@supabase/supabase-js";
export async function authenticateRequest(req: Request) {
  const authHeader =
    req.headers.get("authorization") || req.headers.get("Authorization");

  if (!authHeader?.startsWith("Bearer ")) {
    return { success: false, status: 401, error: "Missing token" };
  }

  const token = authHeader.replace("Bearer ", "").trim();

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false } }
  );

  const { data, error } = await supabase.auth.getUser(token);

  if (error || !data?.user)
    return { success: false, status: 401, error: "Invalid token" };

  return {
    success: true,
    status: 200,
    userId: data.user.id,
    user: data.user,
    token, // <<< ADD THIS
  };
}
