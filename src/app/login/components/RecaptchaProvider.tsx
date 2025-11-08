"use client";

import { GoogleReCaptchaProvider } from "react-google-recaptcha-v3";
import { ReactNode } from "react";

interface RecaptchaProviderProps {
  children: ReactNode;
}

export default function RecaptchaProvider({
  children,
}: RecaptchaProviderProps) {
  const siteKey: string = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || "";

  if (!siteKey) {
    console.error("NEXT_PUBLIC_RECAPTCHA_SITE_KEY is not set.");
    return <>{children}</>;
  }

  return (
    <GoogleReCaptchaProvider
      reCaptchaKey={siteKey}
      scriptProps={{
        async: true,
        defer: true,
      }}
    >
      {children}
    </GoogleReCaptchaProvider>
  );
}
