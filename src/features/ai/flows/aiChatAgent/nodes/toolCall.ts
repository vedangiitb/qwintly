import { handleAiToolCall } from "@/features/ai/services/toolCall.service";
import { ToolCall } from "@/features/ai/types/tools.types";

export const handleToolCall = async (
  toolCalls: ToolCall[],
  chatId: string,
  messageId: string,
  toolDB: any,
): Promise<{ uiToolResponse: ToolCall }> => {
  // Currently we only support one tool call per response
  const toolCall = toolCalls[0];

  await handleAiToolCall(
    toolCall.name,
    toolCall.args,
    chatId,
    messageId,
    toolCall.id,
    toolDB,
  );

  return { uiToolResponse: toolCall };
};
