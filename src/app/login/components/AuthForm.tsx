"use client";
import { useRouter } from "next/navigation";
import { useAuthForm } from "../hooks/useAuthForm";
import { useAuth } from "../contexts/AuthContext";
import { useEmailAuth } from "../hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import PasswordInput from "./PasswordInput";
import { Loader2 } from "lucide-react";
import { validatePassword } from "../utils/validatePassword";
import { mapError } from "../utils/mapError";

type Props = { isExistingUser: boolean };

export default function AuthForm({ isExistingUser }: Props) {
  const router = useRouter();
  const { email, setEmail, userName, setUserName, password, setPassword } = useAuthForm();
  const { loading, error } = useAuth();
  const { login, signUp } = useEmailAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const user = isExistingUser
        ? await login(email, password)
        : await signUp(email, password, userName);
      if (user) router.push("/account");
    } catch (err) {
      console.error("Auth failed", err);
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

      <PasswordInput password={password} setPassword={setPassword} isExistingUser={isExistingUser} />

      <div className="h-5">
        {error && <p className="text-rose-600 text-xs font-medium px-2">{mapError(error)}</p>}
      </div>

      <Button
        type="submit"
        className="w-full h-11 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 transition-colors duration-200 shadow-lg focus:ring-2 focus:ring-indigo-400"
        disabled={loading || !validatePassword(password).isValid}
      >
        {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : isExistingUser ? "Login" : "Sign Up"}
      </Button>
    </form>
  );
}

