import { DEFAULT_MODEL, DEFAULT_PROVIDER } from "@/features/ai/core/modelInfo";
import { UserPreferencesRepository } from "@/features/auth/server/repositories/userPreferences.repository";

export async function getPreferencesService(userId: string, token: string) {
  const repo = new UserPreferencesRepository(token);
  const userPreferences = await repo.getPreferences(userId);

  userPreferences.pref_model = userPreferences.pref_model || DEFAULT_MODEL;
  userPreferences.pref_provider =
    userPreferences.pref_provider || DEFAULT_PROVIDER;
  userPreferences.byok_enabled = Boolean(userPreferences.byok_enabled);

  return userPreferences;
}

export async function toggleByokEnabledService(
  userId: string,
  token: string,
  byokEnabled: boolean,
) {
  const repo = new UserPreferencesRepository(token);
  const updated = await repo.toggleByokEnabled(userId, byokEnabled);
  if (updated) {
    updated.byok_enabled = Boolean(updated.byok_enabled);
  }
  return updated;
}
