import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export const loginWithEmail = async (
  email: string,
  password: string,
  recaptchaToken: string
) => {
  const resp = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ recaptchaToken }),
  });

  if (!resp.ok) {
    const data = await resp.json();
    throw new Error(data.message);
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;

  return data.user;
};

export const signUpWithEmail = async (
  email: string,
  password: string,
  userName: string,
  recaptchaToken: string
) => {
  const resp = await fetch("/api/auth/signup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, userName, recaptchaToken }),
  });

  const data = await resp.json();

  if (!resp.ok) throw new Error(data.message);

  // now login with password
  const { data: session, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
  return session.user;
};
