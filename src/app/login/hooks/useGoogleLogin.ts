"use client";

import {
  startGoogleLogin,
  completeGoogleLogin,
} from "../services/handleGoogleLogin";
import { useAuth } from "../contexts/AuthContext";
import { useCallback } from "react";

export const useGoogleLogin = () => {
  const { setError } = useAuth();
  const { setLoading } = useAuth();

  const loginWithGoogle = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      await startGoogleLogin();
    } catch (err: any) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [setError, setLoading]);

  const handleRedirectResult = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const user = await completeGoogleLogin();
      if (!user) {
        console.log(
          "No redirect result yet. User has not logged in via Google."
        );
        return null;
      }
      return user;
    } catch (err: any) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [setError, setLoading]);

  return { loginWithGoogle, handleRedirectResult };
};
