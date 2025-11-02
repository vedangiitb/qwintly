import { authenticateRequest } from "@/lib/authUtils";
import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

const ai = new GoogleGenAI({});

/**
 * POST /api/chat/stream
 * Streams LLM responses via Server-Sent Events (SSE)
 */
export async function POST(req: Request) {
  try {
    // --- Auth Verification ---
    const auth = await authenticateRequest(req);
    if (!auth.success) {
      return NextResponse.json(
        { success: false, error: auth.error },
        { status: auth.status }
      );
    }
    // --- Parse request body ---
    const { messages, chatId } = await req.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { success: false, error: "Invalid or missing 'messages'" },
        { status: 400 }
      );
    }

    // --- Create a ReadableStream for SSE ---
    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      async start(controller) {
        try {
          const formattedMessages = messages.map((msg: any) => ({
            role: msg.role,
            parts: [{ text: msg.content }],
          }));

          // --- Initialize Gemini streaming ---
          const response = await ai.models.generateContentStream({
            model: "gemini-2.0-flash",
            contents: formattedMessages,
          });

          for await (const chunk of response) {
            if (!chunk) continue;

            const text = chunk.text?.trim();
            if (text) controller.enqueue(encoder.encode(`data: ${text}\n\n`));
          }

          // --- Signal completion ---
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();
        } catch (err: any) {
          console.error("Error in SSE stream:", err);
          controller.enqueue(
            encoder.encode(
              `data: [ERROR] ${err.message || "Internal stream error"}\n\n`
            )
          );
          controller.close();
        }
      },
      cancel(reason) {
        console.log("SSE stream cancelled:", reason);
      },
    });

    // --- Return event stream ---
    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
        "X-Accel-Buffering": "no", // for nginx proxy setups
      },
    });
  } catch (err: any) {
    console.error("Stream API error:", err);
    return NextResponse.json(
      { success: false, error: err?.message || "Error while creating stream" },
      { status: 500 }
    );
  }
}
