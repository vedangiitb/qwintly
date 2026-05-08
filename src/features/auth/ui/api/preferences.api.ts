import { fetchUtil } from "@/utils/fetchUtil";

export type UserPreferences = {
  id: string;
  pref_provider: string | null;
  pref_model: string | null;
};

export async function getPreferences() {
  const response = await fetchUtil<UserPreferences>(
    "/api/preferences/get-preferences",
    { method: "GET" },
  );

  return response.data;
}

export async function updatePreferredProvider(input: { provider: string }) {
  const response = await fetchUtil<UserPreferences>(
    "/api/preferences/update-provider",
    {
      method: "POST",
      body: JSON.stringify(input),
    },
  );

  return response.data;
}

export async function updatePreferredModel(input: { model: string }) {
  const response = await fetchUtil<UserPreferences>("/api/preferences/update-model", {
    method: "POST",
    body: JSON.stringify(input),
  });

  return response.data;
}

