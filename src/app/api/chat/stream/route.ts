import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({});

export async function POST(req: Request) {
  const { prompt } = await req.json();
  console.log(prompt)
  try {
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const response = await ai.models.generateContentStream({
            model: "gemini-2.0-flash",
            contents: prompt,
          });
          for await (const chunk of response) {
            const text = chunk.text;
            controller.enqueue(encoder.encode(`data: ${text}\n\n`));
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
  } catch (e) {
    console.error(e || "Error while creating new chat");
    return NextResponse.json(
      {
        message: e || "Error while creating new chat",
      },
      {
        status: 500,
      }
    );
  }
}
