import { postHandler } from "@/lib/apiHandler";
import { verifyToken } from "@/lib/verifyToken";
import { updatePreferredProviderService } from "@/features/auth/server/services/updatePreferredProvider.service";

export const runtime = "nodejs";

export const POST = postHandler(async ({ body, token }) => {
  const userId = await verifyToken(token);

  const provider = typeof body?.provider === "string" ? body.provider : "";

  return updatePreferredProviderService(provider, userId, token);
});
