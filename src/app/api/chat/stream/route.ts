import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({});

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    console.log(messages);

    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      async start(controller) {
        try {
          const response = await ai.models.generateContentStream({
            model: "gemini-2.0-flash",
            contents: messages.map((msg: any) => ({
              role: msg.role,
              parts: [{ text: msg.content }],
            })),
          });

          for await (const chunk of response) {
            const text = chunk.text;
            if (text) controller.enqueue(encoder.encode(`data: ${text}\n\n`));
          }

          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();
        } catch (e: any) {
          console.error("Error in SSE:", e);
          controller.enqueue(encoder.encode(`data: [ERROR] ${e.message}\n\n`));
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json(
      { message: e?.message || "Error while creating new chat" },
      { status: 500 }
    );
  }
}
