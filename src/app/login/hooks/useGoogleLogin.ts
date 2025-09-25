"use client";

import { handleGoogleLogin } from "../services/handleGoogleLogin";
import { useAuth } from "../contexts/AuthContext";
import { useCallback } from "react";

export const useGoogleLogin = () => {
  const { setError } = useAuth();
  const { setLoading } = useAuth();

  const loginWithGoogle = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const user = await handleGoogleLogin();
      return user;
    } catch (err: any) {
      console.error(err);
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [setError, setLoading]);

  return { loginWithGoogle };
};
