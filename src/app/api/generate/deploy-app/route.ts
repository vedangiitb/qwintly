import { deploymentTrigger } from "@/features/generate/server/services/deploymentTrigger.service";
import { postHandler } from "@/lib/apiHandler";
import { requireNonEmptyString } from "@/lib/require";

export const POST = postHandler(async ({ body, token }) => {
  const chatId = requireNonEmptyString(body?.chatId, "chatId");
  const sessionId = requireNonEmptyString(body?.sessionId, "sessionId");

  return deploymentTrigger(chatId, sessionId, token);
});
