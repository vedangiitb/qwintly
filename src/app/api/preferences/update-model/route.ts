import { postHandler } from "@/lib/apiHandler";
import { verifyToken } from "@/lib/verifyToken";
import { updatePreferredModelService } from "@/features/auth/server/services/updatePreferredModel.service";

export const runtime = "nodejs";

export const POST = postHandler(async ({ body, token }) => {
  const userId = await verifyToken(token);

  const model = typeof body?.model === "string" ? body.model : "";

  return updatePreferredModelService(model, userId, token);
});
