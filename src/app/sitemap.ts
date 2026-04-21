import type { MetadataRoute } from "next";
import { getSiteUrlOrLocalhost } from "@/lib/seo/siteUrl";

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = getSiteUrlOrLocalhost();
  const now = new Date();

  return [
    {
      url: `${siteUrl}/`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    },
  ];
}

