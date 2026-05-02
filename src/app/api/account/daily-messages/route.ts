import { getDailyMessageUsageService } from "@/features/auth/server/services/getDailyMessageUsage.service";
import { getHandler } from "@/lib/apiHandler";
import { verifyToken } from "@/lib/verifyToken";

export const runtime = "nodejs";

export const GET = getHandler(async ({ token }) => {
  const userId = await verifyToken(token);
  return getDailyMessageUsageService(userId);
});
