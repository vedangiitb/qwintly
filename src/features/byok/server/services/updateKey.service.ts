import { UserKeysRepository } from "@/features/byok/server/repositories/userKeys.repository";
import { encrypt } from "@/features/byok/server/services/kms.service";
import {
  ByokProvider,
  validateProviderApiKey,
} from "@/features/byok/server/services/validateProviderKey.service";

export async function updateKeyService(
  params: { keyId: string; provider: string; apiKey: string },
  token: string,
) {
  const keyId = params.keyId?.trim();
  const apiKey = params.apiKey?.trim();
  const provider = params.provider?.trim();

  if (!keyId) throw new Error("Missing or invalid keyId");
  if (!apiKey) throw new Error("Missing or invalid apiKey");

  const repo = new UserKeysRepository(token);
  if (!provider || !["openai", "gemini"].includes(provider))
    throw new Error("Missing or invalid provider");
  await validateProviderApiKey(provider as ByokProvider, apiKey);

  const encryptedKey = await encrypt(apiKey);

  return repo.updateKey(keyId, encryptedKey);
}
