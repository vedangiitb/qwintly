"use client";

import { supabase } from "@/lib/supabase-client";

export const NOT_HUMAN_ERROR = "Failed to authenticate human";

export async function signup(
  email: string,
  password: string,
  userName: string,
  turnstileToken: string,
) {
  // Supabase signup
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      captchaToken: turnstileToken,
      data: { userName },
      emailRedirectTo: `${location.origin}/account`,
    },
  });

  if (error) throw error;

  return data.user;
}

export async function login(
  email: string,
  password: string,
  turnstileToken: string,
) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
    options: {
      captchaToken: turnstileToken,
    },
  });

  if (error) throw error;

  await supabase.auth.getSession();

  return data.user;
}

export async function googleLogin() {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${location.origin}/account`,
    },
  });

  if (error) throw error;
}
