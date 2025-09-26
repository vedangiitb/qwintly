"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "../contexts/AuthContext";
import { useEmailAuth } from "../hooks/useAuth";
import { useAuthForm } from "../hooks/useAuthForm";
import { mapError } from "../utils/mapError";
import { validatePassword } from "../utils/validatePassword";
import PasswordInput from "./PasswordInput";

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
  // Assuming useAuth now manages error states related to reCAPTCHA too
  const { loading, error, setLoading, setError } = useAuth();
  // IMPORTANT: The login and signUp functions MUST now accept the reCAPTCHA token
  const { login, signUp } = useEmailAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      typeof window.grecaptcha === "undefined" ||
      typeof window.grecaptcha.enterprise === "undefined"
    ) {
      setError("reCAPTCHA Enterprise service is loading. Please wait.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const action = isExistingUser ? "login" : "signup";
      const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

      const recaptchaToken = await window.grecaptcha.enterprise.execute(
        siteKey,
        { action }
      );

      const user = isExistingUser
        ? await login(email, password, recaptchaToken)
        : await signUp(email, password, userName, recaptchaToken);

      if (user) router.push("/account");
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
          className="w-full rounded-lg border-gray-300 focus:ring-2 focus:ring-indigo-400"
          autoComplete="username new-username"
          required
        />
      )}

      <Input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full rounded-lg border-gray-300 focus:ring-2 focus:ring-indigo-400"
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
          <p className="text-rose-600 text-xs font-medium px-2">
            {mapError(error)}
          </p>
        )}
      </div>

      <Button
        type="submit"
        className="cursor-pointer w-full h-11 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 transition-colors duration-200 shadow-lg focus:ring-2 focus:ring-indigo-400"
        disabled={loading || !validatePassword(password).isValid}
      >
        {loading ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : isExistingUser ? (
          "Login"
        ) : (
          "Sign Up"
        )}
      </Button>
    </form>
  );
}
