import { supabase } from "@/lib/supabase-client";

// fetchUtil.ts

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

async function getAuthToken(): Promise<string | undefined> {
  if (supabase) {
    try {
      const { data } = await supabase.auth.getSession();
      if (data.session?.access_token) {
        return data.session.access_token;
      }
    } catch (error) {
      throw new Error("Failed to fetch auth token.", error.message);
    }
  }
}

export async function fetchUtil<T>(
  url: string,
  options: RequestInit = {},
): Promise<ApiResponse<T>> {
  const token = await getAuthToken();

  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  let json: ApiResponse<T>;
  try {
    json = await response.json();
  } catch {
    throw new Error("Invalid server response. Please try again later.");
  }

  if (!response.ok || !json.success) {
    throw new Error(json?.error || "Unexpected server error occurred.");
  }

  return json;
}

// fetchStreamUtil.ts
export async function fetchStreamUtil(
  url: string,
  options: RequestInit = {},
): Promise<ReadableStreamDefaultReader<Uint8Array>> {
  const token = await getAuthToken();

  // Perform the request without JSON parsing
  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(`Stream request failed: ${response.status} - ${text}`);
  }

  if (!response.body) {
    throw new Error("Streaming response body missing (response.body is null).");
  }

  return response.body.getReader();
}
