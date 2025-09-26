"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "../contexts/AuthContext";
import {
  loginWithEmail,
  logOut,
  signUpWithEmail,
} from "../services/authService";
import { validatePassword } from "../utils/validatePassword";

export const useEmailAuth = () => {
  const { setLoading, setError } = useAuth();
  const router = useRouter();

  const login = async (email: string, password: string,recaptchaToken: string) => {
    try {
      setLoading(true);
      setError("");
      const user = await loginWithEmail(email, password,recaptchaToken);
      return user;
    } catch (err: any) {
      console.error(err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, userName: string,recaptchaToken: string) => {
    if (!validatePassword(password).isValid) {
      console.error("Invalid password");
      setError("Invalid password");
      return;
    }
    try {
      setLoading(true);
      setError("");
      const user = await signUpWithEmail(email, password, userName,recaptchaToken);
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
