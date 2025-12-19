import { streamHandler } from "@/lib/apiHandler";
import { publishWebsiteGeneration } from "@/lib/mq/websiteGeneration";
import { SYSTEM_PROMPT } from "@/ai/prompts/conversation.prompt";
import { conversationTools } from "@/ai/tools/toolsets/conversation.tools";
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;

export const POST = streamHandler(async ({ body }) => {
  const { messages, chatId } = body;
  if (!messages || !Array.isArray(messages))
    throw new Error("Invalid messages");

  const encoder = new TextEncoder();

  const geminiMessages = [
    { role: "user", parts: [{ text: SYSTEM_PROMPT }] },
    ...messages.map((m: any) => ({
      role: m.role,
      parts: [{ text: m.content }],
    })),
  ];

  const payload = {
    contents: geminiMessages,
    tools: conversationTools,
  };

  const url =
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:streamGenerateContent?alt=sse&key=" +
    GOOGLE_API_KEY;

  const geminiResponse = await fetch(url, {
    method: "POST",
    body: JSON.stringify(payload),
    headers: { "Content-Type": "application/json" },
  });

  if (!geminiResponse.ok) {
    const err = await geminiResponse.text();
    console.error("Gemini Error:", err);
    throw new Error("Failed to call Gemini: " + err);
  }

  const reader = geminiResponse.body?.getReader();
  if (!reader) throw new Error("Gemini stream missing");

  const stream = new ReadableStream({
    async start(controller) {
      let fullBuffer = "";

      try {
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;

          const chunk = new TextDecoder().decode(value);

          // Gemini sends "data: {...}" SSE messages
          const lines = chunk.split("\n");
          for (const line of lines) {
            if (!line.startsWith("data:")) continue;

            const jsonStr = line.substring(5).trim();
            if (jsonStr === "[DONE]") continue;

            let data;
            try {
              data = JSON.parse(jsonStr);
            } catch {
              continue;
            }

            // 1. TEXT TOKENS
            const textParts = data.candidates?.[0]?.content?.parts?.filter(
              (p: any) => p.text
            );
            if (textParts?.length) {
              for (const part of textParts) {
                controller.enqueue(
                  encoder.encode(
                    `data: ${JSON.stringify({
                      type: "token",
                      value: part.text,
                    })}\n\n`
                  )
                );
              }
            }

            // 2. FUNCTION CALL
            const func = data.candidates?.[0]?.content?.parts?.find(
              (p: any) => p.functionCall
            )?.functionCall;

            if (func) {
              const metadata = {
                status: func.args.status,
                schema: func.args.schema,
              };

              const envelope = {
                type: func.args.status === "COMPLETE" ? "complete" : "metadata",
                payload: metadata,
              };

              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify(envelope)}\n\n`)
              );

              if (func.args.status === "COMPLETE") {
                try {
                  await publishWebsiteGeneration({
                    chatId,
                    schema: func.args.schema,
                  });
                } catch (e) {
                  console.error("MQ publish failed:", e);
                }
              }
            }
          }
        }

        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ type: "done" })}\n\n`)
        );
        controller.close();
      } catch (e: any) {
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({
              type: "error",
              message: e.message,
            })}\n\n`
          )
        );
        controller.close();
      }
    },
  });

  return {
    _sse: true,
    response: new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
      },
    }),
  };
});
