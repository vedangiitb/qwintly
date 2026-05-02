import { UserKeysRepository } from "@/features/byok/server/repositories/userKeys.repository";
import { encrypt } from "@/features/byok/server/services/kms.service";
import {
  ByokProvider,
  validateProviderApiKey,
} from "@/features/byok/server/services/validateProviderKey.service";

export async function createKeyService(
  params: { provider: string; apiKey: string },
  token: string,
) {
  const provider = params.provider?.trim();
  const apiKey = params.apiKey?.trim();

  if (!provider || !["openai", "gemini"].includes(provider))
    throw new Error("Missing or invalid provider");
  if (!apiKey) throw new Error("Missing or invalid apiKey");

  const { provider: normalizedProvider } = await validateProviderApiKey(
    provider as ByokProvider,
    apiKey,
  );

  const encryptedKey = await encrypt(apiKey);

  const repo = new UserKeysRepository(token);
  return repo.createKey(normalizedProvider, encryptedKey);
}
