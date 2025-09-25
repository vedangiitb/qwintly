"use client";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useGoogleLogin } from "../hooks/useGoogleLogin";
import { useAuth } from "../contexts/AuthContext";

export default function GoogleLoginButton() {
  const router = useRouter();
  const { loginWithGoogle } = useGoogleLogin();
  const { loading } = useAuth();

  const handleGoogleLogin = async () => {
    try {
      const user = await loginWithGoogle();
      if (user) router.push("/account");
    } catch (err) {
      console.error("Google login failed", err);
    }
  };

  return (
    <Button
      type="button"
      variant="outline"
      className="cursor-pointer w-full flex items-center justify-center gap-3 h-11 rounded-full text-base shadow-sm bg-white hover:bg-gray-50 border-gray-300 transition"
      onClick={handleGoogleLogin}
      disabled={loading}
    >
      {loading ? (
        <Loader2 className="h-5 w-5 animate-spin" />
      ) : (
        <>
          <span className="flex items-center justify-center w-6 h-6 rounded-full bg-white border mr-1">
            <img src="/google-logo.png" alt="google" className="h-4 w-4" />
          </span>
          <span className="text-gray-700">Sign in with Google</span>
        </>
      )}
    </Button>
  );
}
