"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  checkEmailVerified,
  resendVerificationEmail,
} from "../services/verifyService";

export default function AccountCreatedClient() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email");

  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    async function checkVerification() {
      try {
        const isVerified = await checkEmailVerified();
        if (isVerified) {
          router.push("/account");
          return;
        }
      } catch (err) {}
      setChecking(false);
    }

    checkVerification();
  }, [router]);

  const isValidEmail = (emailStr: string | null) => {
    if (!emailStr) return false;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailStr);
  };

  const valid = isValidEmail(email);

  const resendEmail = async () => {
    if (!email) return;

    setLoading(true);
    setMessage("");

    const { sent } = await resendVerificationEmail(email);

    if (!sent) {
      setMessage("Failed to resend email. Please try again later.");
    } else {
      setMessage("Verification email sent again. Please check your inbox!");
    }

    setLoading(false);
  };

  if (checking) {
    return (
      <div className="flex justify-center items-center min-h-screen text-gray-500">
        Checking your account status...
      </div>
    );
  }

  return (
    <div className="flex justify-center px-4 py-16">
      {valid ? (
        <Card className="w-full max-w-md p-8 shadow-md">
          <CardHeader>
            <CardTitle className="text-center text-2xl">
              Account Created Successfully!
            </CardTitle>
          </CardHeader>

          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">
              A verification email has been sent to:
              <br />
              <span className="font-semibold text-muted-foreground">
                {email}
              </span>
            </p>

            <Button
              onClick={resendEmail}
              disabled={loading}
              className="w-full"
              variant="default"
            >
              {loading ? "Sending..." : "Resend Verification Email"}
            </Button>

            {message && <p className="text-sm text-gray-700">{message}</p>}

            <Button variant="outline" className="w-full" asChild>
              <a href="/login">Go to Login</a>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card className="w-full max-w-md p-4 shadow-md">
          <CardHeader>
            <CardTitle className="text-center text-xl text-red-600">
              Invalid or Missing Email
            </CardTitle>
          </CardHeader>

          <CardContent className="text-center space-y-4">
            <p className="text-gray-600">
              This page requires a valid signup email to be passed in the URL.
            </p>

            <Button variant="default" asChild className="w-full">
              <a href="/signup">Return to Signup</a>
            </Button>

            <Button variant="outline" asChild className="w-full">
              <a href="/login">Go to Login</a>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
