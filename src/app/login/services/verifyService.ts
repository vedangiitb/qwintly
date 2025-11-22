import { supabase } from "@/lib/supabase-client";

export async function checkEmailVerified() {
  const { data, error } = await supabase.auth.getUser();

  if (error) throw error;

  return data.user?.email_confirmed_at !== null;
}

export async function resendVerificationEmail(email: string) {
  const { error } = await supabase.auth.resend({
    email,
    type: "signup",
  });

  if (error) {
    return { sent: false, error: error };
  }

  return { sent: true, error: null };
}
