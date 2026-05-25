"use client";
import { useState } from "react";
import AuthForm from "../components/AuthForm";
import AuthHeader from "../components/AuthHeader";
import GoogleLoginButton from "../components/GoogleLoginButton";

export default function AuthContainer() {
  const [isExistingUser, setIsExistingUser] = useState(true);

  return (
    <>
      <div className="flex h-full items-center justify-center bg-transparent px-4 transition-colors duration-300">
        <div className="w-full max-w-md px-6 sm:px-8 py-10 rounded-[2rem] shadow-[0_24px_70px_rgba(28,25,23,0.04)] dark:shadow-[0_24px_70px_rgba(0,0,0,0.18)] bg-white/35 dark:bg-stone-900/35 backdrop-blur-xl border border-stone-200/35 dark:border-stone-800/35 space-y-8 transition-colors duration-300">
          <AuthHeader isExistingUser={isExistingUser} />

          <AuthForm isExistingUser={isExistingUser} />

          <div className="flex items-center gap-3">
            <span className="flex-grow border-t border-stone-200/40 dark:border-stone-800/40" />
            <span className="text-stone-400 dark:text-stone-500 text-xs">or</span>
            <span className="flex-grow border-t border-stone-200/40 dark:border-stone-800/40" />
          </div>

          <GoogleLoginButton />

          {isExistingUser && (
            <p className="pt-2 text-xs text-center text-stone-500 dark:text-stone-400 hover:text-stone-950 dark:hover:text-white cursor-pointer underline underline-offset-2 transition-colors">
              Forgot password?
            </p>
          )}

          <p
            className="pt-2 text-sm text-center cursor-pointer text-stone-700 underline underline-offset-2 transition-colors hover:text-stone-950 dark:text-stone-300 dark:hover:text-white"
            onClick={() => setIsExistingUser(!isExistingUser)}
          >
            {isExistingUser
              ? "Don't have an account? Sign Up"
              : "Already have an account? Login"}
          </p>
        </div>
      </div>
    </>
  );
}
