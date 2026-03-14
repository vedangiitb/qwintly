import { llm } from "@/features/ai/core/llm";
import { AskQuestionsRepository } from "@/features/ai/repository/askQuestions.repository";
import { ToolsRepository } from "@/features/ai/repository/tools.repository";
import { UpdatePlanRepository } from "@/features/ai/repository/updatePlan.repository";
import { CollectedContextRepository } from "@/features/chat/server/repositories/collectedContext.repository";
import { MessagesRepository } from "@/features/chat/server/repositories/messages.repository";
import { WebsiteAgent } from "../flows/aiChatAgent/graph";
import { WebsiteAgentDeps } from "../types/websiteAgent.types";

export const buildWebsiteAgent = (token: string): WebsiteAgent => {
  const deps: WebsiteAgentDeps = {
    llm: llm(),
    messageRepo: new MessagesRepository(token),
    collectedContextRepo: new CollectedContextRepository(token),
    toolCallRepo: new ToolsRepository(token),
    updatePlanRepo: new UpdatePlanRepository(token),
    askQuestionsRepo: new AskQuestionsRepository(token),
  };

  return new WebsiteAgent(deps);
};
