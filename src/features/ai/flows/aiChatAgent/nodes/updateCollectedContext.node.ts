import {
  UPDATE_CONTEXT_SYSTEM_PROMPT,
  USER_MESSAGE_TEMPLATE,
} from "@/features/ai/prompts/updateCollectedContext";
import { llmCallwithTools } from "@/features/ai/services/llm.service";
import { updateContextTool } from "@/features/ai/tools/tools/updateContext.tool";
import { CollectedContextRepository } from "@/features/chat/server/repositories/collectedContext.repository";
import { CollectedContext } from "@/features/chat/types/collectedContext.types";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { ChatGoogleGenerativeAI as ChatGoogle } from "@langchain/google-genai";

export const updateCollectedContext = async (
  llm: ChatGoogle,
  chatId: string,
  userMessage: string,
  collectedContextRepository: CollectedContextRepository,
): Promise<{ collectedContext: CollectedContext }> => {
  console.log("Updating collected context");
  // 1. Fetch current state
  const existingContext =
    await collectedContextRepository.fetchCollectedContext(chatId);
  console.log("Existing context", existingContext);

  // 2. Determine updates via LLM agent
  const updateResult = await handleUpdateContext(
    chatId,
    llm,
    userMessage,
    existingContext,
  );
  console.log("Update result", updateResult);

  // If no tool was called, return the original context
  if (!updateResult) {
    console.log("No updates, returning original context");
    return { collectedContext: existingContext };
  }

  const { updatedContext } = updateResult;

  // 3. Deep comparison and persistence
  const contextHasChanged =
    JSON.stringify(updatedContext) !== JSON.stringify(existingContext);

  if (contextHasChanged) {
    console.log("Context has changed, persisting");
    await collectedContextRepository.persistCollectedContext(
      chatId,
      updatedContext,
    );
  }

  console.log("Returning updated context");

  return { collectedContext: updatedContext };
};

const handleUpdateContext = async (
  chatId: string,
  llm: ChatGoogle,
  userMessage: string,
  existingContext: CollectedContext,
) => {
  console.log("Handling update context");
  const content = [
    new SystemMessage(UPDATE_CONTEXT_SYSTEM_PROMPT),
    new HumanMessage(USER_MESSAGE_TEMPLATE(existingContext, userMessage)),
  ];

  const { toolCalls } = await llmCallwithTools(llm, content, [
    updateContextTool,
  ]);

  if (!toolCalls || toolCalls.length === 0) return null;

  const [toolCall] = toolCalls;

  console.log("Tool call for update context", toolCall);

  if (toolCalls.length > 1) {
    console.warn(
      `Unexpected multiple tool calls in updateCollectedContext for chat ${chatId}`,
    );
  }

  return {
    updatedContext: toolCall.args as CollectedContext,
  };
};
