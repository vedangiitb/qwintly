import { WebsiteAgentDeps } from "@/features/ai/types/websiteAgent.types";
import { toolCallMap } from "@/features/ai/tools/tools";
import { ToolCall } from "@/features/ai/types/tools.types";
import { BaseMessage } from "@langchain/core/messages";
import { END, START, StateGraph } from "@langchain/langgraph";
import { buildAiContext } from "./nodes/buildAiContext";
import { generateAiResponse } from "./nodes/generateResponse";
import { updateCollectedContext } from "./nodes/updateCollectedContext.node";
import { AgentState, AgentStateAnnotation } from "./state";

export class WebsiteAgent {
  private app: any;
  private aiContextDeps: any;

  constructor(private deps: WebsiteAgentDeps) {
    this.aiContextDeps = {
      messagesRepo: deps.messageRepo,
      collectedContextRepo: deps.collectedContextRepo,
      updatePlanRepo: deps.updatePlanRepo,
    };

    this.app = this.buildGraph().compile();
  }

  private updateCollectedContextNode = async (state: AgentState) => {
    const { collectedContext } = await updateCollectedContext(
      this.deps.llm,
      state.chatId,
      state.userMessage,
      this.deps.collectedContextRepo,
    );

    return {
      ...state,
      collectedContext,
    };
  };

  private buildAiContextNode = async (state: AgentState) => {
    const context: BaseMessage[] = await buildAiContext(
      state.chatId,
      state.collectedContext,
      this.aiContextDeps,
    );

    return {
      ...state,
      context,
    };
  };

  private generateAiResponseNode = async (state: AgentState) => {
    const { aiMessageId, responseToUser, toolCalls } = await generateAiResponse(
      this.deps.llm,
      state.context,
      state.chatId,
      this.deps.toolCallRepo,
      this.deps.messageRepo,
      this.toolDbRepo,
    );

    return {
      ...state,
      agentMessageId: aiMessageId,
      aiResponse: responseToUser,
      toolCall: toolCalls,
      uiToolResponse: toolCalls?.[0],
    };
  };

  private toolDbRepo = (toolName: string): unknown => {
    if (toolName === toolCallMap.ASK_QUESTIONS)
      return this.deps.askQuestionsRepo;
    if (toolName === toolCallMap.UPDATE_CONTEXT)
      return this.deps.collectedContextRepo;
    if (toolName === toolCallMap.UPDATE_PLAN) return this.deps.updatePlanRepo;

    return null;
  };

  private buildGraph() {
    const graph = new StateGraph(AgentStateAnnotation)
      .addNode("update_context", this.updateCollectedContextNode)
      .addNode("fetch_context", this.buildAiContextNode)
      .addNode("generate", this.generateAiResponseNode);

    graph.addEdge(START, "update_context");
    graph.addEdge("update_context", "fetch_context");
    graph.addEdge("fetch_context", "generate");
    graph.addEdge("generate", END);

    return graph;
  }

  async runAgentFlow(
    chatId: string,
    userMessage: string,
    userMessageId: string,
  ) {
    const result = await this.app.invoke({
      chatId,
      userMessage,
      userMessageId,
    });

    return {
      aiResponse: result.aiResponse as string,
      agentMessageId: result.agentMessageId as string,
      uiToolResponse: result.uiToolResponse as ToolCall,
    };
  }
}
