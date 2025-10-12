"use client";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useGoogleLogin } from "../hooks/useGoogleLogin";

export default function GoogleLoginButton() {
  const router = useRouter();
  const { loginWithGoogle } = useGoogleLogin();
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      const user = await loginWithGoogle();
      if (user) router.push("/account");
    } catch (err) {
      console.error("Google login failed", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      type="button"
      variant="outline"
      className={`cursor-pointer w-full flex items-center justify-center gap-3 h-11 rounded-full text-base shadow-sm 
    bg-white dark:bg-gray-900 
    hover:bg-gray-50 dark:hover:bg-gray-800 
    border-gray-300 dark:border-gray-700 
    text-gray-700 dark:text-gray-200 
    transition-colors duration-300`}
      onClick={handleGoogleLogin}
      disabled={loading}
    >
      {loading ? (
        <Loader2 className="h-5 w-5 animate-spin text-gray-600 dark:text-gray-300" />
      ) : (
        <>
          <span className="flex items-center justify-center w-6 h-6 rounded-full bg-white dark:bg-gray-800 border mr-1">
            <img
              src="/google-logo.png"
              alt="google"
              className="h-4 w-4 "
            />
          </span>
          <span>Sign in with Google</span>
        </>
      )}
    </Button>
  );
}
