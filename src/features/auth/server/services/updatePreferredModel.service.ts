import { UserPreferencesRepository } from "@/features/auth/server/repositories/userPreferences.repository";
import { AI_MODELS } from "@/features/ai/core/modelInfo";

export async function updatePreferredModelService(
  model: string,
  userId: string,
  token: string,
) {
  if (!model || typeof model !== "string") {
    const error = new Error("Model is required");
    (error as Error & { statusCode?: number }).statusCode = 400;
    throw error;
  }

  const candidate = model.trim();
  const allowedModels = new Set<string>([
    ...Object.values(AI_MODELS.GEMINI),
    ...Object.values(AI_MODELS.OPENAI),
  ]);

  if (!allowedModels.has(candidate)) {
    const error = new Error("Invalid model");
    (error as Error & { statusCode?: number }).statusCode = 400;
    throw error;
  }

  const repo = new UserPreferencesRepository(token);
  const updated = await repo.updatePreferredModel(userId, candidate);
  if (updated) {
    updated.byok_enabled = Boolean(updated.byok_enabled);
  }
  return updated;
}
