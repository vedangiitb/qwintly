"use client";

import { NOT_HUMAN_ERROR } from "@/data/error/authErrors";
import { supabase } from "@/lib/supabase-client";

export async function signup(
  email: string,
  password: string,
  userName: string,
  turnstileToken: string
) {
  // Verify human
  const resp = await fetch("/api/auth/verify-human", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ turnstileToken }),
  });

  if (!resp.ok) {
    const data = await resp.json();
    throw new Error(data.message || NOT_HUMAN_ERROR);
  }

  // Supabase signup
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
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
  turnstileToken: string
) {
  const resp = await fetch("/api/auth/verify-human", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ turnstileToken }),
  });

  if (!resp.ok) {
    const data = await resp.json();
    throw new Error(data.message || NOT_HUMAN_ERROR);
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
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
