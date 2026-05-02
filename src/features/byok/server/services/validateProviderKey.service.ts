import { httpError } from "@/lib/httpError";

export type ByokProvider = "openai" | "gemini";

async function fetchWithTimeout(
  url: string,
  init: RequestInit,
  timeoutMs: number,
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timeoutId);
  }
}

function verificationUnavailableMessage(provider: ByokProvider): string {
  return `Could not verify ${provider === "openai" ? "OpenAI" : "Gemini"} key right now. Please try again.`;
}

export async function validateProviderApiKey(
  provider: ByokProvider,
  apiKey: string,
  options?: { timeoutMs?: number },
): Promise<{ provider: ByokProvider }> {
  // const provider = normalizeProvider(providerInput);
  const timeoutMs = options?.timeoutMs ?? 8000;

  if (!apiKey?.trim()) {
    throw httpError("Missing or invalid apiKey", 400);
  }

  if (provider === "openai") {
    let res: Response;
    try {
      res = await fetchWithTimeout(
        "https://api.openai.com/v1/models",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${apiKey}`,
          },
        },
        timeoutMs,
      );
    } catch {
      throw httpError(verificationUnavailableMessage(provider), 503);
    }

    if (res.ok) return { provider };
    if (res.status === 401 || res.status === 403) {
      throw httpError("Invalid OpenAI API key", 400);
    }
    if (res.status === 429 || res.status >= 500) {
      throw httpError(verificationUnavailableMessage(provider), 503);
    }
    throw httpError(verificationUnavailableMessage(provider), 503);
  }

  // provider === "gemini"
  let res: Response;
  try {
    res = await fetchWithTimeout(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(
        apiKey,
      )}`,
      { method: "GET" },
      timeoutMs,
    );
  } catch {
    throw httpError(verificationUnavailableMessage(provider), 503);
  }

  if (res.ok) return { provider };
  if (res.status === 400 || res.status === 401 || res.status === 403) {
    throw httpError("Invalid Gemini API key", 400);
  }
  if (res.status === 429 || res.status >= 500) {
    throw httpError(verificationUnavailableMessage(provider), 503);
  }
  throw httpError(verificationUnavailableMessage(provider), 503);
}
