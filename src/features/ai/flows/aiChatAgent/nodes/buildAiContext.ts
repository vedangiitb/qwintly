import { websiteAgentPrompt } from "@/features/ai/prompts/websiteAgent.prompt";
import { UpdatePlanRepository } from "@/features/ai/repository/updatePlan.repository";
import { CollectedContextRepository } from "@/features/chat/server/repositories/collectedContext.repository";
import { MessagesRepository } from "@/features/chat/server/repositories/messages.repository";
import { RecentMsgContext } from "@/features/chat/types/messages.types";
import {
  AIMessage,
  BaseMessage,
  HumanMessage,
  SystemMessage,
} from "@langchain/core/messages";

export interface AiContextDependencies {
  messageRepo: MessagesRepository;
  collectedContextRepo: CollectedContextRepository;
  updatePlanRepo: UpdatePlanRepository;
}

export const buildAiContext = async (
  convId: string,
  deps: AiContextDependencies,
): Promise<BaseMessage[]> => {
  console.log("Building AI Context");

  const [fullContext, recentMessages, previousPlans] = await Promise.all([
    deps.collectedContextRepo.fetchFullProjectContext(convId),
    deps.messageRepo.fetchRecentContext(convId),
    deps.updatePlanRepo.fetchPrevPlans(convId, 8),
  ]);

  const { collectedContext, projectInfo } = fullContext;

  const systemPrompt = websiteAgentPrompt(
    collectedContext,
    projectInfo,
    previousPlans,
  );

  const context = [
    new SystemMessage(systemPrompt),
    ...recentMessages.map(mapMessageToBaseMessage),
  ];

  console.log("Built AiContext", context);
  return context;
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

export const mapMessageToBaseMessage = (msg: RecentMsgContext): BaseMessage => {
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
