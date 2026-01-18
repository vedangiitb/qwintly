import NavBar from "@/components/layouts/navbar/navbar";
import { Toaster } from "@/components/ui/sonner";
import { Providers } from "@/lib/Providers";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ChatSessionProvider } from "./generate/hooks/chatSessionContext";

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
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased h-screen overflow-hidden custom-scrollbar`}
      >
        {" "}
        <ChatSessionProvider>
          <Providers>
            <div className="flex flex-col h-screen">
              <NavBar />
              {children}
            </div>
          </Providers>
        </ChatSessionProvider>
        <Toaster position="top-center" />
      </body>
    </html>
  );
}
