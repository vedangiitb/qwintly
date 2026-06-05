import type { MetadataRoute } from "next";
import { getSiteUrlOrLocalhost, isProductionSite } from "@/lib/seo/siteUrl";

export default function sitemap(): MetadataRoute.Sitemap {
  if (!isProductionSite()) {
    return [];
  }

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

