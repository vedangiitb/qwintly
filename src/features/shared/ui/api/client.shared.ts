import { fetchStreamUtil, fetchUtil } from "@/utils/fetchUtil";

export interface HttpClient {
  get<T>(url: string, signal?: AbortSignal): Promise<T>;
  post<T>(url: string, body?: unknown, signal?: AbortSignal): Promise<T>;
  getStream(
    url: string,
    signal?: AbortSignal,
  ): Promise<ReadableStreamDefaultReader<Uint8Array>>;
}

export class FetchUtilHttpClient implements HttpClient {
  async get<T>(url: string, signal?: AbortSignal): Promise<T> {
    const response = await fetchUtil<T>(url, {
      method: "GET",
      signal,
    });
    return response.data as T;
  }

  async post<T>(url: string, body?: unknown, signal?: AbortSignal): Promise<T> {
    const response = await fetchUtil<T>(url, {
      method: "POST",
      body: body === undefined ? undefined : JSON.stringify(body),
      signal,
    });
    return response.data as T;
  }

  async getStream(
    url: string,
    signal?: AbortSignal,
  ): Promise<ReadableStreamDefaultReader<Uint8Array>> {
    return fetchStreamUtil(url, {
      method: "GET",
      signal,
    });
  }
}

export const toClientErrorMessage = (
  error: unknown,
  fallbackMessage: string,
): string => {
  if (error instanceof Error && error.message.trim()) return error.message;
  return fallbackMessage;
};

export const ensureNonEmptyString = (value: unknown, fieldName: string): string => {
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`Missing or invalid ${fieldName}`);
  }

  return value.trim();
};

export const buildUrl = (
  basePath: string,
  query: Record<string, string | number | undefined>,
): string => {
  const searchParams = new URLSearchParams();

  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      searchParams.set(key, String(value));
    }
  });

  const queryString = searchParams.toString();
  return queryString ? `${basePath}?${queryString}` : basePath;
};

export const isAbortError = (error: unknown): boolean => {
  if (error instanceof DOMException && error.name === "AbortError") {
    return true;
  }

  return error instanceof Error && error.name === "AbortError";
};
