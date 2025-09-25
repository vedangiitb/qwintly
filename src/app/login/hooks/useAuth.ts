"use client";

import { useRouter } from "next/navigation";
import {
  loginWithEmail,
  signUpWithEmail,
  logOut,
} from "../services/authService";

import { useAuth } from "../contexts/AuthContext";
import { validatePassword } from "../utils/validatePassword";

export const useEmailAuth = () => {
  const { setLoading, setError } = useAuth();
  const router = useRouter();

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError("");
      const user = await loginWithEmail(email, password);
      return user;
    } catch (err: any) {
      console.error(err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, userName: string) => {
    if (!validatePassword(password).isValid) {
      console.error("Invalid password")
      setError("Invalid password")
      return;
    }
    try {
      setLoading(true);
      setError("");
      const user = await signUpWithEmail(email, password, userName);
      return user;
    } catch (err: any) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      await logOut();
      router.push("/login");
    } catch (err: any) {
      console.error(err);
    }
  };

  return { login, signUp, signOut };
};
