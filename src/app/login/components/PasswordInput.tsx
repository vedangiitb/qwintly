"use client";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import PasswordTooltip from "./PasswordTooltip";

type Props = {
  password: string;
  setPassword: (val: string) => void;
  isExistingUser: boolean;
};

export default function PasswordInput({
  password,
  setPassword,
  isExistingUser,
}: Props) {
  const [showPassword, setShowPassword] = useState(false);
  const [tooltipVisible, setTooltipVisible] = useState(false);

  return (
    <div className="relative">
      <Input
        type={showPassword ? "text" : "password"}
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full rounded-lg border border-gray-300 dark:border-gray-700 
               bg-white dark:bg-gray-900 
               text-gray-800 dark:text-gray-100 
               placeholder-gray-400 dark:placeholder-gray-500 
               focus:ring-2 focus:ring-indigo-400 dark:focus:ring-indigo-500 
               focus:border-indigo-400 dark:focus:border-indigo-500 
               transition-colors duration-300"
        autoComplete={isExistingUser ? "current-password" : "new-password"}
        onFocus={() => setTooltipVisible(true)}
        onBlur={() => setTooltipVisible(false)}
        required
      />

      <button
        type="button"
        onClick={() => setShowPassword(!showPassword)}
        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-gray-100 text-gray-500 transition"
        aria-label={showPassword ? "Hide password" : "Show password"}
      >
        {showPassword ? (
          <EyeOff className="h-5 w-5" />
        ) : (
          <Eye className="h-5 w-5" />
        )}
      </button>

      {!isExistingUser && tooltipVisible && (
        <PasswordTooltip password={password} />
      )}
    </div>
  );
}
