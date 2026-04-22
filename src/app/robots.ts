import type { MetadataRoute } from "next";
import { getSiteUrlOrLocalhost } from "@/lib/seo/siteUrl";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = getSiteUrlOrLocalhost();

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Keep private/app areas out of crawl budget.
        disallow: ["/api/", "/login", "/account", "/account-created", "/generate"],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}

