import { persistAgentResult } from "@/features/ai/services/agentCall.service";
import {
  StreamChunk,
  streamLlmCallWithTools,
} from "@/features/ai/services/llm.service";
import { toolCallMap } from "@/features/ai/tools/tools";
import { askQuestionsTool } from "@/features/ai/tools/tools/askQuestions.tool";
import { updatePlanTool } from "@/features/ai/tools/tools/updatePlan.tool";
import { ToolCall } from "@/features/ai/types/tools.types";
import { WebsiteAgentDeps } from "@/features/ai/types/websiteAgent.types";
import { buildAiContext } from "./nodes/buildAiContext";
import { updateCollectedContext } from "./nodes/updateCollectedContext.node";

export class WebsiteAgent {
  constructor(private readonly deps: WebsiteAgentDeps) {}

  private readonly toolDbRepo = (toolName: string): unknown => {
    if (toolName === toolCallMap.ASK_QUESTIONS)
      return this.deps.askQuestionsRepo;
    if (toolName === toolCallMap.UPDATE_CONTEXT)
      return this.deps.collectedContextRepo;
    if (toolName === toolCallMap.UPDATE_PLAN) return this.deps.updatePlanRepo;

    return null;
  };

  async *streamAgentFlow(
    chatId: string,
    userMessage: string,
  ): AsyncGenerator<StreamChunk & { agentMessageId?: string }, void, unknown> {
    console.log("Starting streamAgentFlow");

    // 1. Get context
    const context = await buildAiContext(chatId, this.deps);

    // 2. Start updateCollectedContext concurrently in the background
    const updatePromise = updateCollectedContext(
      this.deps.llm,
      chatId,
      userMessage,
      this.deps.collectedContextRepo,
    ).catch((err) => {
      console.error("Background updateCollectedContext failed:", err);
      return null;
    });

    // 3. Stream response to the client
    const toolCallRepo = this.deps.toolCallRepo;
    const messagesRepo = this.deps.messageRepo;
    const resolveToolRepository = this.toolDbRepo;

    const llmStream = streamLlmCallWithTools(this.deps.llm, context, [
      updatePlanTool,
      askQuestionsTool,
    ]);

    let lastResponseToUser = "";
    let lastToolCalls: ToolCall[] = [];

    for await (const chunk of llmStream) {
      if (chunk.type === "text" && chunk.content) {
        yield chunk;
      } else if (chunk.type === "done") {
        lastResponseToUser = chunk.fullText ?? "";
        lastToolCalls = chunk.toolCalls ?? [];
      }
    }

    // 4. Persist the final response and tool execution
    const persistPromise = persistAgentResult(
      lastResponseToUser,
      lastToolCalls,
      chatId,
      toolCallRepo,
      messagesRepo,
      resolveToolRepository,
    );

    // Wait for BOTH background update and DB persist to finish
    const [_, agentResult] = await Promise.all([updatePromise, persistPromise]);

    // 5. Yield the final done event with full message info & tool call details
    yield {
      type: "done",
      fullText: agentResult.responseToUser,
      toolCalls: agentResult.toolCalls,
      agentMessageId: agentResult.aiMessageId,
    };
  }
}
