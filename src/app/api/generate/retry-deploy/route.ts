import { GenSnapshotsRepository } from "@/features/generate/server/repositories/genSessions.repository";
import { deploymentTrigger } from "@/features/generate/server/services/deploymentTrigger.service";
import { postHandler } from "@/lib/apiHandler";
import { requireNonEmptyString } from "@/lib/require";

export const POST = postHandler(async ({ body, token }) => {
  const chatId = requireNonEmptyString(body?.chatId, "chatId");
  const retrySessionId = requireNonEmptyString(
    body?.sessionId,
    "retrySessionId",
  );

  const repo = new GenSnapshotsRepository(token);
  const sessionId = await repo.getGenIdbyDeploymentId(retrySessionId);

  if (!sessionId) throw new Error("No session found");

  return deploymentTrigger(chatId, sessionId, token);
});
