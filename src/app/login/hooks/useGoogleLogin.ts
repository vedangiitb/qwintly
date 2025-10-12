"use client";

import { handleGoogleLogin } from "../services/handleGoogleLogin";
import { useAuth } from "./AuthContext";
import { useCallback } from "react";

export const useGoogleLogin = () => {
  const { setError } = useAuth();

  const loginWithGoogle = useCallback(async () => {
    try {
      setError("");
      const user = await handleGoogleLogin();
      return user;
    } catch (err: any) {
      console.error(err);
      setError(err.message);
      return null;
    }
  }, [setError]);

  return { loginWithGoogle };
};
