"use client";
import { login, signup } from "../services/authService";
import { validatePassword } from "../utils/validatePassword";
import { useAuth } from "./useAuth";

export const useEmailAuth = () => {
  const { setError } = useAuth();

  const loginUser = async (
    email: string,
    password: string,
    turnstileToken: string
  ) => {
    try {
      setError("");
      const user = await login(email, password, turnstileToken);
      return user;
    } catch (err: any) {
      setError(err.message);
    }
  };

  const registerUser = async (
    email: string,
    password: string,
    userName: string,
    turnstileToken: string
  ) => {
    const validation = validatePassword(password);
    if (!validation.isValid) {
      setError("Invalid password");
      return;
    }

    try {
      setError("");
      const user = await signup(email, password, userName, turnstileToken);
      return user;
    } catch (err: any) {
      setError(err.message);
    }
  };

  return { login: loginUser, signUp: registerUser };
};
