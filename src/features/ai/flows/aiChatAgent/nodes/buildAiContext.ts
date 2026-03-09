import { websiteAgentPrompt } from "@/features/ai/prompts/websiteAgent.prompt";
import { UpdatePlanRepository } from "@/features/ai/repository/updatePlan.repository";
import { CollectedContextRepository } from "@/features/chat/server/repositories/collectedContext.repository";
import { MessagesRepository } from "@/features/chat/server/repositories/messages.repository";
import { CollectedContext } from "@/features/chat/types/collectedContext.types";
import { RecentMsgContext } from "@/features/chat/types/messages.types";
import { Plan } from "@/features/ai/types/updatePlan.types";
import {
  AIMessage,
  BaseMessage,
  HumanMessage,
  SystemMessage,
} from "@langchain/core/messages";

export interface AiContextDependencies {
  messagesRepo: MessagesRepository;
  collectedContextRepo: CollectedContextRepository;
  updatePlanRepo: UpdatePlanRepository;
}

export const buildAiContext = async (
  convId: string,
  collectedContext: CollectedContext,
  deps: AiContextDependencies,
): Promise<BaseMessage[]> => {
  console.log("Building AI Context");
  const { messagesRepo, collectedContextRepo, updatePlanRepo } = deps;

  const [recentMessages, projectContext, previousPlan] = await Promise.all([
    messagesRepo.fetchRecentContext(convId),
    collectedContextRepo.fetchProjectInfo(convId),
    updatePlanRepo.fetchPrevPlan(convId),
  ]);

  const systemPrompt = websiteAgentPrompt(
    collectedContext,
    projectContext,
    previousPlan,
  );

  const aiContext = mapToBaseMessages(systemPrompt, recentMessages);
  console.log("Built AiContext", aiContext);
  return aiContext;
};

const mapToBaseMessages = (
  systemPrompt: string,
  recentMessages: RecentMsgContext[],
): BaseMessage[] => {
  return [
    new SystemMessage(systemPrompt),
    ...recentMessages.map(mapMessageToBaseMessage),
  ];
};

const mapMessageToBaseMessage = (msg: RecentMsgContext): BaseMessage => {
  const role = msg.role.toLowerCase();

  switch (role) {
    case "user":
      return new HumanMessage(msg.content);

    case "assistant":
    case "model":
      return new AIMessage(attachToolEventIfPresent(msg));

    case "system":
      return new SystemMessage(msg.content);

    default:
      throw new Error(`Unknown message role: ${msg.role}`);
  }
};

const attachToolEventIfPresent = (msg: RecentMsgContext): string => {
  if (!msg.toolName) return msg.content;

  const summary =
    typeof msg.toolSummary === "string"
      ? msg.toolSummary
      : JSON.stringify(msg.toolSummary ?? {});

  return `${msg.content}

[tool_event]
name: ${msg.toolName}
status: ${msg.toolStatus ?? "unknown"}
summary: ${summary}
[/tool_event]`;
};
