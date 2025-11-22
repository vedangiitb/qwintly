// fetchUtil.ts

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

export async function fetchUtil<T>(
  url: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  // Read Supabase session from localStorage
  const raw = localStorage.getItem("sb-jxceaahrdymuhokduqdt-auth-token");
  const session = raw ? JSON.parse(raw) : null;
  const token = session?.access_token;

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
