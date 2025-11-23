import { streamHandler } from "@/lib/apiHandler";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({});

/**
 * POST /api/chat/stream
 * Streams LLM responses via Server-Sent Events (SSE)
 */
export const POST = streamHandler(async ({ body,token }) => {
  const { messages } = body;

  const encoder = new TextEncoder();

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    throw new Error("Invalid or missing 'messages'");
  }

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

  return stream;
});
