export function getSiteUrlFromEnv(): string | undefined {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (explicit) return explicit.replace(/\/+$/, "");

  return undefined;
}

export function getSiteUrlOrLocalhost(): string {
  return getSiteUrlFromEnv() ?? "http://localhost:8080";
}

export function isProductionSite(): boolean {
  const siteUrl = getSiteUrlFromEnv();
  if (!siteUrl) return false;
  const normalized = siteUrl.replace(/^https?:\/\/(www\.)?/, "");
  return normalized === "qwintly.com";
}
