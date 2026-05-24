import { GenSnapshotsRepository } from "@/features/generate/server/repositories/genSessions.repository";
import { generationTrigger } from "@/features/generate/server/services/generationTrigger.service";
import { postHandler } from "@/lib/apiHandler";
import { createHttpError } from "@/lib/httpError";
import { requireNonEmptyString } from "@/lib/require";

export const POST = postHandler(async ({ body, token }) => {
  const chatId = requireNonEmptyString(body?.chatId, "chatId");
  const retrySessionId = requireNonEmptyString(
    body?.sessionId,
    "retrySessionId",
  );

  const repo = new GenSnapshotsRepository(token);
  const planId = await repo.getPlanIdByGenId(retrySessionId);

  if (!planId) throw createHttpError(404, "No plan found for that session");

  return generationTrigger(chatId, planId, token);
});
