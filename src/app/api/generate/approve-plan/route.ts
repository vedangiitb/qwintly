import { generationTriggerService } from "@/features/generate/server/services/generationTrigger.service";
import { postHandler } from "@/lib/apiHandler";
import { verifyToken } from "@/lib/verifyToken";

export const POST = postHandler(async ({ body, token }) => {
  const { chatId } = body ?? {};

  if (typeof chatId !== "string" || !chatId.trim()) {
    const error = new Error("Missing or invalid chatId");
    (error as Error & { statusCode?: number }).statusCode = 400;
    throw error;
  }

  await verifyToken(token);

  return generationTriggerService(chatId.trim());
});
