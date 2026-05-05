import { fetchGenerationSummaryService } from "@/features/generate/server/services/generationSummary.service";
import { getHandler } from "@/lib/apiHandler";
import { verifyToken } from "@/lib/verifyToken";

export const GET = getHandler(async ({ query, token }) => {
  const msgId = query.get("msgId");

  if (typeof msgId !== "string" || !msgId.trim()) {
    const error = new Error("Missing or invalid msgId");
    (error as Error & { statusCode?: number }).statusCode = 400;
    throw error;
  }

  await verifyToken(token);
  return fetchGenerationSummaryService(msgId.trim(), token);
});

