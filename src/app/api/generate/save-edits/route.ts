import { saveEdits } from "@/features/generate/server/services/saveEdits.service";
import { postHandler } from "@/lib/apiHandler";
import { createHttpError } from "@/lib/httpError";
import { requireNonEmptyString } from "@/lib/require";

export const POST = postHandler(async ({ body, token }) => {
  const route = requireNonEmptyString(body?.route, "route");

  if (!Array.isArray(body?.operations)) {
    throw createHttpError(400, "Missing or invalid operations list");
  }

  const genId = typeof body?.genId === "string" ? body.genId.trim() : "";

  return saveEdits(genId, route, body.operations, token);
});
