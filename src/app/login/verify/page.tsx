"use client";
import { Button } from "@/components/ui/button";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";

export default function VerifyAccount() {
  const searchParams = useSearchParams();
  const userId = searchParams.get("id");
  const { user } = useAuth();

  const router = useRouter();
  const { refreshUser } = useAuth();

  const [otpVal, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ isError: boolean; msg: string }>({
    isError: false,
    msg: "",
  });

  if (!userId) {
    return (
      <div>
        <p>No user ID found in URL</p>
      </div>
    );
  }

  const verifyOtp = async (otp = otpVal) => {
    if (otp.length !== 6) {
      setMessage({ isError: true, msg: "Please enter a 6-digit OTP" });
      return;
    }

    setLoading(true);
    setMessage({ isError: false, msg: "" });

    try {
      const resp = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ otp, userId }),
      });

      const data = await resp.json();

      if (resp.ok) {
        setMessage({ isError: false, msg: "OTP verified successfully!" });
        await refreshUser();
        router.push("/account");
      } else {
        setMessage({
          isError: true,
          msg: data.error || "OTP verification failed",
        });
      }
    } catch (error: any) {
      setMessage({
        isError: true,
        msg: error.message || "Something went wrong",
      });
    } finally {
      setLoading(false);
    }
  };

  const resendOtp = async () => {
    if (!user || !user.email || !user.uid) {
      setMessage({
        isError: true,
        msg: "Unknown Error occured, please login again",
      });
      return;
    }
    setLoading(true);
    setMessage({ isError: false, msg: "" });

    try {
      const resp = await fetch("/api/auth/resend-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user.email, userId: user.uid }),
      });

      const data = await resp.json();

      if (resp.ok) {
        setMessage({ isError: false, msg: "OTP resent successfully!" });
      } else {
        setMessage({
          isError: true,
          msg: data.error || "Failed to resend OTP",
        });
      }
    } catch (error: any) {
      setMessage({
        isError: true,
        msg: error.message || "Something went wrong",
      });
    } finally {
      setLoading(false);
    }
  };

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
        <Button onClick={() => verifyOtp()} disabled={loading}>
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
