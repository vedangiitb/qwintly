import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/app/login/hooks/AuthContext";
import Script from "next/script";
import { Toaster } from "@/components/ui/sonner";
import { PromptProvider } from "./generate/hooks/chat/PromptContext";

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

  const enterpriseScriptUrl = `https://www.google.com/recaptcha/enterprise.js?render=${siteKey}`;

  return (
    <html lang="en">
      <head>
        <Script
          src={enterpriseScriptUrl}
          strategy="beforeInteractive"
          async
          defer
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          <PromptProvider>{children}</PromptProvider>
        </AuthProvider>

        <Toaster />
      </body>
    </html>
  );
}
