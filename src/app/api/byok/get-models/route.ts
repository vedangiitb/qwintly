import { getModels } from "@/features/byok/server/services/getModels.service";
import { getHandler } from "@/lib/apiHandler";
import { verifyToken } from "@/lib/verifyToken";

export const runtime = "nodejs";

export const GET = getHandler(async ({ token }) => {
  await verifyToken(token);

  const models = await getModels(token);

  return models;
});
