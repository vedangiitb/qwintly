import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Account Created",
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
};

export default function AccountCreatedLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}

