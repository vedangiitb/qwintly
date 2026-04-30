import {
  UserKey,
  UserKeysRepository,
} from "@/features/byok/server/repositories/userKeys.repository";

export async function getKeyInfoService(token: string): Promise<UserKey[]> {
  const repo = new UserKeysRepository(token);
  return repo.fetchKeysDetail();
}
