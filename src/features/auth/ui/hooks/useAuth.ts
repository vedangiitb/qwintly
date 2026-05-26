"use client";

import { useEffect, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "@/lib/store";
import { listenToAuthChanges, logoutUser, setError as setReduxError } from "@/lib/features/authSlice";
import { useRouter } from "next/navigation";

export const useAuth = () => {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();

  const { user, loading, error } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    dispatch(listenToAuthChanges());
  }, [dispatch]);

  const logout = useCallback(async () => {
    await dispatch(logoutUser());
    router.push("/");
  }, [dispatch, router]);

  const setError = useCallback((err: string) => {
    dispatch(setReduxError(err || null));
  }, [dispatch]);

  const currentUser = user?.displayName || user?.email?.split("@")[0] || "";

  return {
    user,
    currentUser,
    loading,
    error: error || "",
    logout,
    setError,
  };
};

