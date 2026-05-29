import { ApiResponse } from "@/lib/apiHandler";
import { StreamChunk } from "@/features/ai/services/llm.service";

type AgentStreamChunk = StreamChunk & { agentMessageId?: string };

export const createChatSseResponse = <TDonePayload extends Record<string, any>>(
  params: {
    stream: AsyncIterable<AgentStreamChunk>;
    buildDonePayload: (chunk: AgentStreamChunk) => TDonePayload;
  },
): { _sse: true; response: Response } => {
  const encoder = new TextEncoder();

  const customReadable = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of params.stream) {
          if (chunk.type === "text" && chunk.content) {
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({
                  type: "text",
                  delta: chunk.content,
                })}\n\n`,
              ),
            );
            continue;
          }

          if (chunk.type === "done") {
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({
                  type: "done",
                  ...params.buildDonePayload(chunk),
                })}\n\n`,
              ),
            );
          }
        }
      } catch (error) {
        console.error("Streaming error in customReadable:", error);
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({
              type: "error",
              message: error instanceof Error ? error.message : String(error),
            })}\n\n`,
          ),
        );
      } finally {
        controller.close();
      }
    },
  });

  return {
    _sse: true,
    response: ApiResponse.stream(customReadable),
  };
};

