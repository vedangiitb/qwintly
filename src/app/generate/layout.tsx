import type { Metadata } from "next";
import GenerateLayoutClient from "./GenerateLayoutClient";

export const metadata: Metadata = {
  title: "Generate",
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
};

export default function GenerateLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <GenerateLayoutClient>{children}</GenerateLayoutClient>;
}
