"use client";
import { useState } from "react";
import AuthForm from "./components/AuthForm";
import AuthHeader from "./components/AuthHeader";
import GoogleLoginButton from "./components/GoogleLoginButton";

export default function AuthContainer() {
  const [isExistingUser, setIsExistingUser] = useState(true);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-sky-100 to-purple-100 px-4">
      <div className="w-full max-w-md px-6 sm:px-8 py-10 rounded-xl shadow-xl bg-white/70 backdrop-blur-lg border border-slate-200 space-y-8">
        <AuthHeader isExistingUser={isExistingUser} />

        <AuthForm isExistingUser={isExistingUser} />

        <div className="flex items-center gap-3">
          <span className="flex-grow border-t border-gray-300" />
          <span className="text-gray-400 text-xs">or</span>
          <span className="flex-grow border-t border-gray-300" />
        </div>

        <GoogleLoginButton />

        {isExistingUser && (
          <p className="pt-2 text-xs text-center text-gray-600 hover:text-primary cursor-pointer underline underline-offset-2">
            Forgot password?
          </p>
        )}

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
