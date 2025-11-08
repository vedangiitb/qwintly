"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "./AuthContext";
import { resendOtpService, verifyOtpService } from "../services/verifyService";

export const useVerify = () => {
  const { user } = useAuth();
  const userId = user?.uid;
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ isError: boolean; msg: string }>({
    isError: false,
    msg: "",
  });

  const verifyOtp = async (otp: string) => {
    if (!userId) {
      setMessage({
        isError: true,
        msg: "Failed to load user data, please login again",
      });
      return;
    }

    if (otp.length !== 6) {
      setMessage({ isError: true, msg: "Please enter a 6-digit OTP" });
      return;
    }

    setLoading(true);
    setMessage({ isError: false, msg: "" });

    try {
      const { isVerified, error } = await verifyOtpService(otp, userId);

      if (isVerified) {
        setMessage({ isError: false, msg: "OTP verified successfully!" });
        router.push("/account");
      } else {
        setMessage({
          isError: true,
          msg: error || "OTP verification failed",
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
      const { sent, error } = await resendOtpService(user.email, user.uid);
      if (sent) {
        setMessage({ isError: false, msg: "OTP resent successfully!" });
      } else {
        setMessage({
          isError: true,
          msg: error || "Failed to resend OTP",
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

  return { verifyOtp, resendOtp, loading, message };
};
