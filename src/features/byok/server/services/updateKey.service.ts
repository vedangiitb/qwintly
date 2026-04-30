import { UserKeysRepository } from "@/features/byok/server/repositories/userKeys.repository";
import { encrypt } from "@/features/byok/server/services/kms.service";

export async function updateKeyService(
  params: { keyId: string; apiKey: string },
  token: string,
) {
  const keyId = params.keyId?.trim();
  const apiKey = params.apiKey?.trim();

  if (!keyId) throw new Error("Missing or invalid keyId");
  if (!apiKey) throw new Error("Missing or invalid apiKey");

  const encryptedKey = await encrypt(apiKey);

  const repo = new UserKeysRepository(token);
  return repo.updateKey(keyId, encryptedKey);
}

