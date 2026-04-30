import { postHandler } from "@/lib/apiHandler";
import { verifyToken } from "@/lib/verifyToken";
import { createKeyService } from "@/features/byok/server/services/createKey.service";

export const runtime = "nodejs";

type CreateNewKeyBody = {
  provider?: unknown;
  apiKey?: unknown;
};

export const POST = postHandler(
  async ({ body, token }: { body: CreateNewKeyBody; token: string }) => {
    await verifyToken(token);

    const provider = typeof body?.provider === "string" ? body.provider : "";
    const apiKey = typeof body?.apiKey === "string" ? body.apiKey : "";

    return createKeyService({ provider, apiKey }, token);
  },
);
