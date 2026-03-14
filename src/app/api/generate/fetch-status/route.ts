// app/api/generation/status/route.ts

import { createGenerationStatusStream } from "@/features/generate/server/services/generationStatus.service";
import { verifyToken } from "@/lib/verifyToken";
import { NextRequest } from "next/server";

export const runtime = "nodejs"; // Required for SSE

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const chatId = searchParams.get("chatId");
  const token = req.headers.get("authorization")?.replace("Bearer ", "") ?? "";

  if (!chatId?.trim()) {
    return new Response("Missing or invalid chatId", { status: 400 });
  }

  if (!token) {
    return new Response("Unauthorized", { status: 401 });
  }

  await verifyToken(token);

  const stream = createGenerationStatusStream(chatId.trim(), token);

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
