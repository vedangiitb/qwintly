import { websiteAgentPrompt } from "@/features/ai/prompts/websiteAgent.prompt";
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
import { SystemMessage } from "@langchain/core/messages";
import { mapMessageToBaseMessage } from "./nodes/buildAiContext";
import { updateCollectedContext } from "./nodes/updateCollectedContext.node";

export class WebsiteAgent {
  private aiContextDeps: any;

  constructor(private deps: WebsiteAgentDeps) {}

  private toolDbRepo = (toolName: string): unknown => {
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
    userMessageId: string,
  ): AsyncGenerator<StreamChunk & { agentMessageId?: string }, void, unknown> {
    console.log("Starting streamAgentFlow");

    // 1. Fetch DB context once, and recent context + plan in parallel
    const [fullContext, recentMessages, previousPlans] = await Promise.all([
      this.deps.collectedContextRepo.fetchFullProjectContext(chatId),
      this.deps.messageRepo.fetchRecentContext(chatId),
      this.deps.updatePlanRepo.fetchPrevPlans(chatId, 8),
    ]);

    const { collectedContext, projectInfo } = fullContext;

    // 2. Build AI Context system prompt
    const systemPrompt = websiteAgentPrompt(
      collectedContext,
      projectInfo,
      previousPlans,
    );

    const context = [
      new SystemMessage(systemPrompt),
      ...recentMessages.map(mapMessageToBaseMessage),
    ];

    // 3. Start updateCollectedContext concurrently in the background
    const updatePromise = updateCollectedContext(
      this.deps.llm,
      chatId,
      userMessage,
      this.deps.collectedContextRepo,
    ).catch((err) => {
      console.error("Background updateCollectedContext failed:", err);
      return null;
    });

    // 4. Stream response to the client
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

    // 5. Persist the final response and tool execution
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

    // 6. Yield the final done event with full message info & tool call details
    yield {
      type: "done",
      fullText: agentResult.responseToUser,
      toolCalls: agentResult.toolCalls,
      agentMessageId: agentResult.aiMessageId,
    };
  }
}
