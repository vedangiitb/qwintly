import { postHandler } from "@/lib/apiHandler";
import { verifyToken } from "@/lib/verifyToken";
import { deleteKeyService } from "@/features/byok/server/services/deleteKey.service";

export const runtime = "nodejs";

export const POST = postHandler(async ({ body, token }) => {
  await verifyToken(token);

  const keyId = typeof body?.keyId === "string" ? body.keyId : "";

  return deleteKeyService({ keyId }, token);
});
