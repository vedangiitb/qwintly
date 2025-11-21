interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

export async function fetchUtil<T>(
  url: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
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
