import { supabaseAdmin } from "./supabase-server";

export async function authenticateRequest(req: Request) {
  try {
    const supabase = supabaseAdmin();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return { success: false, status: 401, error: "Unauthorized" };
    }

    return { success: true, userId: user.id };
  } catch (err: any) {
    console.error("Supabase token verification failed:", err);
    return {
      success: false,
      status: 401,
      error: "Token verification failed",
    };
  }
}
