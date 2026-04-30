import { getKeyInfoService } from "@/features/byok/server/services/getKeyInfo.service";
import { getHandler } from "@/lib/apiHandler";
import { verifyToken } from "@/lib/verifyToken";

export const runtime = "nodejs";

export const GET = getHandler(async ({ token }) => {
  await verifyToken(token);

  const keys = await getKeyInfoService(token);

  return keys;
});
