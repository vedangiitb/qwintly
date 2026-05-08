import { getHandler } from "@/lib/apiHandler";
import { verifyToken } from "@/lib/verifyToken";
import { getPreferencesService } from "@/features/auth/server/services/getPreferences.service";

export const runtime = "nodejs";

export const GET = getHandler(async ({ token }) => {
  const userId = await verifyToken(token);

  return getPreferencesService(userId, token);
});
