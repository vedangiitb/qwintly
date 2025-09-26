import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/app/login/contexts/AuthContext";
import Script from "next/script";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Qwintly",
  description: "Website Generator",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

  // IMPORTANT: The render parameter must be set to the Site Key
  const enterpriseScriptUrl = `https://www.google.com/recaptcha/enterprise.js?render=${siteKey}`;

  return (
    <html lang="en">
      <head>
        {/*
          CORRECTION: Move the Script tag inside the <head> element.
          strategy="beforeInteractive" is correct for reCAPTCHA as it needs to load early.
        */}
        <Script
          src={enterpriseScriptUrl}
          strategy="beforeInteractive" // Keep this to load the script before hydration
          async
          defer
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
