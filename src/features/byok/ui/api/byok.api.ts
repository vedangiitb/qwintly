import { fetchUtil } from "@/utils/fetchUtil";

export type ByokProvider = "gemini" | "openai";

export type UserApiKeyDetails = {
  id: string;
  provider: string;
  createdAt: string;
  updatedAt?: string | null;
  lastUsedAt?: string | null;
  keyVersion: number;
  isActive?: boolean;
};

export async function fetchKeyDetails() {
  const response = await fetchUtil<UserApiKeyDetails[]>(
    "/api/byok/get-key-details",
    {
      method: "GET",
    },
  );

  return response.data ?? [];
}

export async function createProviderKey(input: {
  provider: ByokProvider;
  apiKey: string;
}) {
  const response = await fetchUtil<UserApiKeyDetails>(
    "/api/byok/create-new-key",
    {
      method: "POST",
      body: JSON.stringify(input),
    },
  );

  return response.data;
}

export async function updateProviderKey(input: {
  keyId: string;
  provider: string;
  apiKey: string;
}) {
  const response = await fetchUtil<UserApiKeyDetails>("/api/byok/update-key", {
    method: "POST",
    body: JSON.stringify(input),
  });

  return response.data;
}

export async function deleteProviderKey(input: { keyId: string }) {
  const response = await fetchUtil<{ success: boolean }>(
    "/api/byok/delete-key",
    {
      method: "POST",
      body: JSON.stringify(input),
    },
  );

  return response.data;
}
