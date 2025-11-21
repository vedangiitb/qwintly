"use client";

import { useEffect, useCallback, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "@/lib/store";
import { listenToAuthChanges, logoutUser } from "@/lib/features/authSlice";
import { useRouter } from "next/navigation";

export const useAuth = () => {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const [error, setError] = useState("");

  const { user, loading } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    dispatch(listenToAuthChanges());
  }, [dispatch]);

  const logout = useCallback(async () => {
    await dispatch(logoutUser());
    router.push("/");
  }, [dispatch, router]);

  const currentUser = user?.displayName || user?.email?.split("@")[0] || "";

  return {
    user,
    currentUser,
    loading,
    error,
    logout,
    setError,
  };
};
