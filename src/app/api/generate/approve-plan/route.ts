import { generationTriggerService } from "@/features/generate/server/services/generationTrigger.service";
import { postHandler } from "@/lib/apiHandler";
import { verifyToken } from "@/lib/verifyToken";

export const POST = postHandler(async ({ body, token }) => {
  const { chatId, planId } = body ?? {};

  if (
    typeof chatId !== "string" ||
    !chatId.trim() ||
    typeof planId !== "string" ||
    !planId.trim()
  ) {
    const error = new Error("Missing or invalid payload");
    (error as Error & { statusCode?: number }).statusCode = 400;
    throw error;
  }

  await verifyToken(token);

  return generationTriggerService(chatId.trim(), planId.trim());
});
