"use client";
import { Button } from "@/components/ui/button";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "../hooks/AuthContext";
import { useVerify } from "../hooks/useVerify";

export default function VerifyAccount() {
  const [otpVal, setOtp] = useState("");
  const {verifyOtp,resendOtp,loading,message} = useVerify()

  useEffect(() => {
    if (otpVal.length === 6) {
      const timeout = setTimeout(() => verifyOtp(otpVal), 300);
      return () => clearTimeout(timeout);
    }
  }, [otpVal]);

  return (
    <div className="max-w-md mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4 text-green-600">
        Verify Your Account
      </h2>

      <InputOTP
        maxLength={6}
        value={otpVal}
        inputMode="numeric"
        aria-label="Enter 6-digit OTP"
        onChange={(value) => setOtp(value)}
        onKeyDown={(e) => {
          const allowedKeys = [
            "Backspace",
            "Tab",
            "ArrowLeft",
            "ArrowRight",
            "Enter",
          ];

          if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "v") {
            return;
          }

          if (!/^[0-9]$/.test(e.key) && !allowedKeys.includes(e.key)) {
            e.preventDefault();
          }
          if (e.key === "Enter" && otpVal.length === 6) {
            verifyOtp(otpVal);
          }
        }}
      >
        <InputOTPGroup>
          <InputOTPSlot index={0} />
          <InputOTPSlot index={1} />
          <InputOTPSlot index={2} />
        </InputOTPGroup>
        <InputOTPSeparator />
        <InputOTPGroup>
          <InputOTPSlot index={3} />
          <InputOTPSlot index={4} />
          <InputOTPSlot index={5} />
        </InputOTPGroup>
      </InputOTP>

      <div className="mt-4 flex flex-col gap-2">
        <Button onClick={() => verifyOtp(otpVal)} disabled={loading}>
          {loading ? "Verifying..." : "Submit"}
        </Button>
        <Button variant="secondary" onClick={resendOtp} disabled={loading}>
          Resend OTP
        </Button>
      </div>

      {message.msg && (
        <p
          className={`mt-4 ${message.isError ? "text-red-500" : "text-green-500"}`}
        >
          {message.msg}
        </p>
      )}
    </div>
  );
}
