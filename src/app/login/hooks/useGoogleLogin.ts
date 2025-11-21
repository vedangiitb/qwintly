"use client";

import { useCallback } from "react";
import { googleLogin } from "../services/authService";
import { useAuth } from "./useAuth";

export const useGoogleLogin = () => {
  const { setError } = useAuth();

  const login = useCallback(async () => {
    try {
      setError("");
      await googleLogin();
    } catch (err: any) {
      setError(err.message);
    }
  }, []);

  return { login };
};
