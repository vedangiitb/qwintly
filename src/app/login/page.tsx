"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useEmailAuth } from "./hooks/useAuth";
import { useAuthForm } from "./hooks/useAuthForm";
import { useGoogleLogin } from "./hooks/useGoogleLogin";

import { useAuth } from "./contexts/AuthContext";

export default function SignIn() {
  const router = useRouter();
  const { email, setEmail, userName, setUserName, password, setPassword } =
    useAuthForm();
  const { loading, error } = useAuth();

  const [isExistingUser, setIsExistingUser] = useState(true);

  const { login, signUp } = useEmailAuth();

  const { loginWithGoogle, handleRedirectResult } = useGoogleLogin();

  useEffect(() => {
    const checkRedirect = async () => {
      const user = await handleRedirectResult();
      if (user) {
        router.push("/account");
      }
    };
    checkRedirect();
  }, []);

  const handleSubmit = async () => {
    const user = isExistingUser
      ? await login(email, password)
      : await signUp(email, password, userName);

    if (user) {
      router.push("/account");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted">
      <div className="w-full max-w-md px-8 py-10 rounded-xl shadow-xl bg-white/70 backdrop-blur-lg border border-slate-200 space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold tracking-tight text-primary drop-shadow">
            {isExistingUser ? "Welcome Back 👋" : "Join Us 🚀"}
          </h2>
          <p className="mt-2 text-muted-foreground text-sm">
            {isExistingUser
              ? "Login to your account"
              : "Create your new account"}
          </p>
        </div>
        <form className="space-y-5">
          {!isExistingUser && (
            <Input
              type="text"
              placeholder="Username"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className="w-full"
              autoComplete="username"
            />
          )}
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full"
            autoComplete="email"
          />
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full"
            autoComplete={isExistingUser ? "current-password" : "new-password"}
          />
          {error && (
            <p className="text-rose-600 text-xs font-medium px-2">{error}</p>
          )}

          <Button
            type="button"
            className="w-full h-11 rounded-lg bg-primary hover:bg-primary/90 transition-colors duration-150 shadow focus:ring-2 focus:ring-primary/40"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <span className="animate-pulse">Processing...</span>
            ) : isExistingUser ? (
              "Login"
            ) : (
              "Sign Up"
            )}
          </Button>
        </form>

        <div className="flex items-center gap-3">
          <span className="flex-grow border-t border-gray-300" />
          <span className="text-gray-400 text-xs">or</span>
          <span className="flex-grow border-t border-gray-300" />
        </div>

        <Button
          type="button"
          variant="outline"
          className="w-full flex items-center justify-center gap-3 h-11 rounded-lg text-base shadow-sm hover:bg-primary/10"
          onClick={loginWithGoogle}
          disabled={loading}
        >
          <img src="/google-logo.png" alt="google" className="h-5 w-5" />
          <span>Sign in with Google</span>
        </Button>

        <p
          className="pt-2 text-sm text-center cursor-pointer text-primary underline underline-offset-2 transition-colors hover:text-primary/80"
          onClick={() => setIsExistingUser(!isExistingUser)}
        >
          {isExistingUser
            ? "Don't have an account? Sign Up"
            : "Already have an account? Login"}
        </p>
      </div>
    </div>
  );
}
