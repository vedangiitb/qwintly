import NavBar from "@/components/layouts/navbar/navbar";
import { Toaster } from "@/components/ui/sonner";
import { Providers } from "@/lib/Providers";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ChatProvider } from "@/features/chat/ui/hooks/chatContext";
import Script from "next/script";
import { getSiteUrlFromEnv, getSiteUrlOrLocalhost, isProductionSite } from "@/lib/seo/siteUrl";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const defaultTitle = "Qwintly";
const defaultDescription =
  "Qwintly is an AI-powered app generator. Describe what you want, and get a production-ready application with modern code.";

export function generateMetadata(): Metadata {
  const siteUrl = getSiteUrlFromEnv();
  const metadataBase = siteUrl ? new URL(siteUrl) : undefined;

  return {
    metadataBase,
    title: {
      default: defaultTitle,
      template: `%s | ${defaultTitle}`,
    },
    description: defaultDescription,
    applicationName: defaultTitle,
    icons: {
      icon: "/qwintlylogo.png",
      shortcut: "/qwintlylogo.png",
      apple: "/qwintlylogo.png",
    },
    alternates: {
      canonical: "/",
    },
    openGraph: {
      type: "website",
      url: "/",
      siteName: defaultTitle,
      title: defaultTitle,
      description: defaultDescription,
      images: [
        {
          url: "/opengraph-image",
          width: 1200,
          height: 630,
          alt: `${defaultTitle} - AI-Powered App Generation`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: defaultTitle,
      description: defaultDescription,
      images: ["/opengraph-image"],
    },
    robots: isProductionSite()
      ? {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            "max-image-preview": "large",
            "max-snippet": -1,
            "max-video-preview": -1,
          },
        }
      : {
          index: false,
          follow: false,
          googleBot: {
            index: false,
            follow: false,
          },
        },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const GA_ID = process.env.NEXT_PUBLIC_GA_ID;
  const structuredDataSiteUrl = getSiteUrlOrLocalhost();

  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          // JSON-LD should be present in initial HTML for crawlers.
          dangerouslySetInnerHTML={{
            __html: JSON.stringify([
              {
                "@context": "https://schema.org",
                "@type": "Organization",
                name: defaultTitle,
                url: structuredDataSiteUrl,
                logo: `${structuredDataSiteUrl}/qwintlylogo.png`,
              },
              {
                "@context": "https://schema.org",
                "@type": "WebSite",
                name: defaultTitle,
                url: structuredDataSiteUrl,
              },
            ]),
          }}
        />

        {GA_ID ? (
          <>
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
          </>
        ) : null}
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased h-dvh overflow-hidden custom-scrollbar`}
      >
        {" "}
        <ChatProvider>
          <Providers>
            <div className="flex flex-col h-dvh w-full bg-[linear-gradient(180deg,#f7f3ea_0%,#f2efe6_55%,#ece8df_100%)] dark:bg-[linear-gradient(180deg,#111111_0%,#171717_55%,#1c1917_100%)] transition-colors duration-500">
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
