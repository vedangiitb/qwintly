"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useEmailAuth } from "../hooks/useEmailAuth";
import { useAuthForm } from "../hooks/useAuthForm";
import { mapError } from "../utils/mapError";
import { validatePassword } from "../utils/validatePassword";
import PasswordInput from "./PasswordInput";
import { useAuth } from "../hooks/useAuth";

declare global {
  interface Window {
    grecaptcha: any;
  }
}

type Props = { isExistingUser: boolean };

export default function AuthForm({ isExistingUser }: Props) {
  const router = useRouter();
  const { email, setEmail, userName, setUserName, password, setPassword } =
    useAuthForm();
  const { error, setError } = useAuth();
  const [loading, setLoading] = useState(false);
  const { login, signUp } = useEmailAuth();

  console.log(error)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      typeof window.grecaptcha === "undefined" ||
      typeof window.grecaptcha.enterprise === "undefined"
    ) {
      console.log(window)
      setError("reCAPTCHA Enterprise service is loading. Please wait.");
      return;
    }

    try {
      console.log("1")
      setLoading(true);
      setError("");

      const action = isExistingUser ? "login" : "signup";
      const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

      const recaptchaToken = await window.grecaptcha.enterprise.execute(
        siteKey,
        { action }
      );

      console.log(recaptchaToken)

      const user = isExistingUser
        ? await login(email, password, recaptchaToken)
        : await signUp(email, password, userName, recaptchaToken);

      if (user) {
        console.log("hello")
        isExistingUser ? router.push("/account") : router.push(`/login/verify`);
      }
    } catch (err: any) {
      console.error("Auth failed");
      setError(err.message || "An unknown error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      {!isExistingUser && (
        <Input
          type="text"
          placeholder="Username"
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
          className="w-full rounded-lg border border-gray-300 dark:border-gray-700 
                 bg-white dark:bg-gray-900 
                 text-gray-800 dark:text-gray-100 
                 placeholder-gray-400 dark:placeholder-gray-500 
                 focus:ring-2 focus:ring-indigo-400 dark:focus:ring-indigo-500 
                 focus:border-indigo-400 dark:focus:border-indigo-500 
                 transition-colors duration-300"
          autoComplete="username new-username"
          required
        />
      )}

      <Input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full rounded-lg border border-gray-300 dark:border-gray-700 
               bg-white dark:bg-gray-900 
               text-gray-800 dark:text-gray-100 
               placeholder-gray-400 dark:placeholder-gray-500 
               focus:ring-2 focus:ring-indigo-400 dark:focus:ring-indigo-500 
               focus:border-indigo-400 dark:focus:border-indigo-500 
               transition-colors duration-300"
        autoComplete="email"
        required
      />

      <PasswordInput
        password={password}
        setPassword={setPassword}
        isExistingUser={isExistingUser}
      />

      <div className="h-5">
        {error && (
          <p className="text-rose-600 dark:text-rose-400 text-xs font-medium px-2">
            {mapError(error)}
          </p>
        )}
      </div>

      <Button
        type="submit"
        className="cursor-pointer w-full h-11 rounded-lg 
               bg-gradient-to-r from-indigo-500 to-purple-500 
               hover:from-indigo-600 hover:to-purple-600 
               dark:from-indigo-600 dark:to-purple-700 
               dark:hover:from-indigo-700 dark:hover:to-purple-800 
               text-white shadow-lg 
               focus:ring-2 focus:ring-indigo-400 dark:focus:ring-indigo-600 
               transition-all duration-300"
        disabled={
          loading || (!validatePassword(password).isValid && !isExistingUser)
        }
      >
        {loading ? (
          <Loader2 className="h-5 w-5 animate-spin text-white" />
        ) : isExistingUser ? (
          "Login"
        ) : (
          "Sign Up"
        )}
      </Button>
    </form>
  );
}
