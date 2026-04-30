import { UserKeysRepository } from "@/features/byok/server/repositories/userKeys.repository";
import { encrypt } from "@/features/byok/server/services/kms.service";

export async function createKeyService(
  params: { provider: string; apiKey: string },
  token: string,
) {
  const provider = params.provider?.trim();
  const apiKey = params.apiKey?.trim();

  if (!provider) throw new Error("Missing or invalid provider");
  if (!apiKey) throw new Error("Missing or invalid apiKey");

  const encryptedKey = await encrypt(apiKey);

  const repo = new UserKeysRepository(token);
  return repo.createKey(provider, encryptedKey);
}

