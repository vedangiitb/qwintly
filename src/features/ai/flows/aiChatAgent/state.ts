import { CollectedContext } from "@/features/chat/types/collectedContext.types";
import { ProjectInfo } from "@/features/chat/types/projectInfo.types";
import { ToolCall } from "@/features/ai/types/tools.types";
import { BaseMessage } from "@langchain/core/messages";
import { Annotation } from "@langchain/langgraph";

export type AgentState = {
  chatId: string;
  userMessage: string;

  userMessageId: string;
  agentMessageId: string;

  collectedContext?: CollectedContext;
  projectInfo?: ProjectInfo;

  context: BaseMessage[];
  aiResponse?: string;

  toolCall?: ToolCall[];
  uiToolResponse?: ToolCall;
};

export const AgentStateAnnotation = Annotation.Root({
  chatId: Annotation<string>(),
  userMessage: Annotation<string>(),
  userMessageId: Annotation<string>(),
  agentMessageId: Annotation<string | undefined>(),
  collectedContext: Annotation<CollectedContext | undefined>(),
  projectInfo: Annotation<ProjectInfo | undefined>(),
  context: Annotation<BaseMessage[] | undefined>(),
  aiResponse: Annotation<string | undefined>(),
  toolCall: Annotation<ToolCall[] | undefined>(),
  uiToolResponse: Annotation<ToolCall | undefined>(),
});
