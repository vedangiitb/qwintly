import { getIdToken } from "@/utils/userIdTokenUtil";

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

export async function fetchWithAuth<T>(
  url: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const token = await getIdToken();
  if (!token) throw new Error("You must be logged in to perform this action.");

  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
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
