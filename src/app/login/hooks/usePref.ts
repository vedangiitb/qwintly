"use client";
import { useState } from "react";

export const usePref = () => {
  const [isExistingUser, setIsExistingUser] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  return {
    isExistingUser,
    setIsExistingUser,
    loading,
    error,
    setLoading,
    setError,
  };
};
