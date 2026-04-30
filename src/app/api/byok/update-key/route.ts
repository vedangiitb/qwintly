import { postHandler } from "@/lib/apiHandler";
import { verifyToken } from "@/lib/verifyToken";
import { updateKeyService } from "@/features/byok/server/services/updateKey.service";

export const runtime = "nodejs";

export const POST = postHandler(async ({ body, token }) => {
  await verifyToken(token);

  const keyId = typeof body?.keyId === "string" ? body.keyId : "";

  const apiKey = typeof body?.apiKey === "string" ? body.apiKey : "";

  return updateKeyService({ keyId, apiKey }, token);
});
