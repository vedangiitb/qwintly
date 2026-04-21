export function getSiteUrlFromEnv(): string | undefined {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (explicit) return explicit.replace(/\/+$/, "");

  // Vercel sets this in production (no protocol).
  const vercel = process.env.VERCEL_URL?.trim();
  if (vercel) return `https://${vercel.replace(/\/+$/, "")}`;

  return undefined;
}

export function getSiteUrlOrLocalhost(): string {
  return getSiteUrlFromEnv() ?? "http://localhost:3000";
}

