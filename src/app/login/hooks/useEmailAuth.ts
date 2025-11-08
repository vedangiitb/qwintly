"use client";

import { useAuth } from "./AuthContext";
import { loginWithEmail, signUpWithEmail } from "../services/authService";
import { validatePassword } from "../utils/validatePassword";

export const useEmailAuth = () => {
  const { setError } = useAuth();

  const login = async (
    email: string,
    password: string,
    recaptchaToken: string
  ) => {
    try {
      const user = await loginWithEmail(email, password, recaptchaToken);
      return user;
    } catch (err: any) {
      setError(err.message);
    }
  };

  const signUp = async (
    email: string,
    password: string,
    userName: string,
    recaptchaToken: string
  ) => {
    if (!validatePassword(password).isValid) {
      console.error("Invalid password");
      setError("Invalid password");
      return;
    }
    try {
      setError("");
      const user = await signUpWithEmail(
        email,
        password,
        userName,
        recaptchaToken
      );
      return user;
    } catch (err: any) {
      console.error(err);
      setError(err.message);
    }
  };

  return { login, signUp };
};
