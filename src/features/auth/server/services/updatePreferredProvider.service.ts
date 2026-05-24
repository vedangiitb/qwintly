import { UserPreferencesRepository } from "@/features/auth/server/repositories/userPreferences.repository";
import { MODEL_PROVIDERS } from "@/features/ai/core/modelInfo";

export async function updatePreferredProviderService(
  provider: string,
  userId: string,
  token: string,
) {
  if (!provider || typeof provider !== "string") {
    const error = new Error("Provider is required");
    (error as Error & { statusCode?: number }).statusCode = 400;
    throw error;
  }

  const normalized = provider.trim().toLowerCase();
  const allowed = new Set<string>([
    MODEL_PROVIDERS.GEMINI,
    MODEL_PROVIDERS.OPENAI,
  ]);

  if (!allowed.has(normalized)) {
    const error = new Error("Invalid provider");
    (error as Error & { statusCode?: number }).statusCode = 400;
    throw error;
  }

  // Persist canonical UI value for OpenAI
  const persistedProvider =
    normalized === MODEL_PROVIDERS.OPENAI ? "openai" : normalized;

  const repo = new UserPreferencesRepository(token);
  const updated = await repo.updatePreferredProvider(userId, persistedProvider);
  if (updated) {
    updated.byok_enabled = Boolean(updated.byok_enabled);
  }
  return updated;
}
