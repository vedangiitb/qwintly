import NavBar from "@/components/layouts/navbar/navbar";
import { Toaster } from "@/components/ui/sonner";
import { Providers } from "@/lib/Providers";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ChatProvider } from "@/features/chat/ui/hooks/chatContext";
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

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Load GA */}
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_ID}', {
              page_path: window.location.pathname,
            });
          `}
        </Script>
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased h-screen overflow-hidden custom-scrollbar`}
      >
        {" "}
        <ChatProvider>
          <Providers>
            <div className="flex flex-col h-screen">
              <NavBar />
              {children}
            </div>
          </Providers>
        </ChatProvider>
        <Toaster position="top-center" />
      </body>
    </html>
  );
}
