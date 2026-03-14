import { ToolsRepository } from "@/features/ai/repository/tools.repository";
import { agentCall } from "@/features/ai/services/agentCall.service";
import { askQuestionsTool } from "@/features/ai/tools/tools/askQuestions.tool";
import { updatePlanTool } from "@/features/ai/tools/tools/updatePlan.tool";
import { MessagesRepository } from "@/features/chat/server/repositories/messages.repository";
import { BaseMessage } from "@langchain/core/messages";
import { ChatGoogleGenerativeAI as ChatGoogle } from "@langchain/google-genai";

const AI_CHAT_AGENT_TOOLS = [updatePlanTool, askQuestionsTool] as const;
type ToolRepositoryResolver = (toolName: string) => unknown;

type GenerateAiResponseResult = Awaited<ReturnType<typeof agentCall>>;

export const generateAiResponse = async (
  llm: ChatGoogle,
  context: BaseMessage[],
  chatId: string,
  toolCallRepo: ToolsRepository,
  messagesRepo: MessagesRepository,
  resolveToolRepository?: ToolRepositoryResolver,
): Promise<GenerateAiResponseResult> => {
  console.log("Generating AI Response");
  const { aiMessageId, responseToUser, toolCalls } = await agentCall(
    llm,
    [...AI_CHAT_AGENT_TOOLS],
    context,
    chatId,
    toolCallRepo,
    messagesRepo,
    resolveToolRepository,
  );

  console.log(
    `Generated AI Response: MessageId: ${aiMessageId}, Response To User: ${responseToUser}, Tool Calls${toolCalls}`,
  );

  return {
    aiMessageId,
    responseToUser,
    toolCalls,
  };
};
