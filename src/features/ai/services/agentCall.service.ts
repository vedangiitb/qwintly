import { MessagesRepository } from "@/features/chat/server/repositories/messages.repository";
import { persistMessage } from "@/features/chat/server/services/persistMessage.service";
import {
  MESSAGE_TYPES,
  MessageType,
  ROLES,
} from "@/features/chat/types/messages.types";
import { TOOL_CALL_STATUS, ToolCall } from "@/features/ai/types/tools.types";
import { BaseMessage } from "@langchain/core/messages";
import { ChatGoogleGenerativeAI as ChatGoogle } from "@langchain/google-genai";
import { ToolsRepository } from "../repository/tools.repository";
import { TOOL_TO_MESSAGE_TYPE } from "../tools/tools";
import { llmCallwithTools } from "./llm.service";
import {
  getToolCallSummary,
  handleAiToolCall,
  persistToolCall,
} from "./toolCall.service";

type ToolRepositoryResolver = (toolName: string) => unknown;

// Define a clear interface for the result
interface AgentResponse {
  aiMessageId: string;
  responseToUser: string;
  toolCalls: ToolCall[];
}

export const agentCall = async (
  llm: ChatGoogle,
  tools: any[],
  context: BaseMessage[],
  chatId: string,
  toolCallRepo: ToolsRepository,
  messagesRepo: MessagesRepository,
  resolveToolRepository?: ToolRepositoryResolver,
): Promise<AgentResponse> => {
  console.log("Agent Call");
  // 1. Bind and Invoke
  const { responseToUser, toolCalls } = await llmCallwithTools(
    llm,
    context,
    tools,
  );
  let aiMessageId: string | null = null;

  console.log("Ai Response to user", responseToUser);
  console.log("Ai tool calls", toolCalls);

  const messageType = toolCalls
    ? resolveMessageType(toolCalls[0]?.name)
    : MESSAGE_TYPES.MESSAGE;

  aiMessageId = await persistMessage({
    chatId,
    content: responseToUser ?? "Tool Called",
    role: ROLES.MODEL,
    repo: messagesRepo,
    type: messageType,
  });

  let toolCallsList: ToolCall[] = [];

  if (toolCalls) {
    // 2. Process all tool calls in parallel for better performance
    toolCallsList = await Promise.all(
      toolCalls.map(async (call) => {
        if (!aiMessageId) {
          throw new Error("AI message not found");
        }
        const summary = getToolCallSummary(call.name, call.args);
        const messageId = aiMessageId;

        const toolCallId = await persistToolCall(
          toolCallRepo,
          chatId,
          messageId,
          call,
          summary,
        );

        try {
          console.log("Handling AI Tool Call");
          await handleAiToolCall(
            call.name,
            call.args,
            chatId,
            messageId,
            toolCallId,
            resolveToolRepository?.(call.name),
          );

          await toolCallRepo.updateToolCallStatus(
            toolCallId,
            TOOL_CALL_STATUS.SUCCESS,
          );
        } catch (error) {
          await toolCallRepo.updateToolCallStatus(
            toolCallId,
            TOOL_CALL_STATUS.FAILED,
          );
          throw error;
        }

        return {
          id: toolCallId,
          name: call.name,
          args: call.args,
        };
      }),
    );
  }

  console.log("Agent Response", aiMessageId, responseToUser);
  console.log("Tool calls", toolCallsList);

  return {
    aiMessageId,
    responseToUser,
    toolCalls: toolCallsList,
  };
};

const resolveMessageType = (toolName?: string): MessageType => {
  if (!toolName) return MESSAGE_TYPES.MESSAGE;

  return TOOL_TO_MESSAGE_TYPE[toolName] ?? MESSAGE_TYPES.MESSAGE;
};
