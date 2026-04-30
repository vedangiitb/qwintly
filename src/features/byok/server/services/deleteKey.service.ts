import { UserKeysRepository } from "@/features/byok/server/repositories/userKeys.repository";

export async function deleteKeyService(params: { keyId: string }, token: string) {
  const keyId = params.keyId?.trim();
  if (!keyId) throw new Error("Missing or invalid keyId");

  const repo = new UserKeysRepository(token);
  return repo.deleteKey(keyId);
}

