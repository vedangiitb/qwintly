import { BaseMessage } from "@langchain/core/messages";
import { ChatGoogleGenerativeAI as ChatGoogle } from "@langchain/google-genai";
import { ToolCall } from "@/features/ai/types/tools.types";
import { toolCallMap } from "../tools/tools";
import { parseToolCall } from "./toolCall.service";

const TOOL_RESPONSE_FALLBACKS: Record<string, string> = {
  [toolCallMap.UPDATE_PLAN]: "I updated the plan.",
  [toolCallMap.ASK_QUESTIONS]: "I need a few clarifications before I can continue.",
};

const TOOL_CALL_TEXT_PATTERNS = [
  /\bdefault_api\./i,
  /\bupdate_plan\s*\(/i,
  /\bask_questions\s*\(/i,
  /\btool_code\b/i,
  /\bprint\s*\(/i,
];

const extractUserFacingText = (
  responseText: string | undefined,
  toolNames: string[],
): string => {
  const trimmedText = responseText?.trim() ?? "";
  if (!trimmedText) {
    return toolNames.length > 0
      ? TOOL_RESPONSE_FALLBACKS[toolNames[0]] ?? "Working on that."
      : "";
  }

  const looksLikeSerializedToolCall =
    toolNames.length > 0 &&
    TOOL_CALL_TEXT_PATTERNS.some((pattern) => pattern.test(trimmedText));

  if (looksLikeSerializedToolCall) {
    return TOOL_RESPONSE_FALLBACKS[toolNames[0]] ?? "Working on that.";
  }

  return trimmedText;
};

export const simpleLLMCall = async (
  llm: ChatGoogle,
  messages: BaseMessage[],
) => {
  const response = await llm.invoke(messages);
  return response.text ?? "";
};

export const llmCallwithTools = async (
  llm: ChatGoogle,
  context: BaseMessage[],
  tools: any[],
): Promise<{ responseToUser: string; toolCalls: ToolCall[] }> => {
  const modelWithTools = llm.bindTools(tools);
  const response = await modelWithTools.invoke(context);
  if (!response.tool_calls && !response.text)
    throw new Error("No response from LLM");
  const toolsCalled = response.tool_calls ?? [];

  const toolCalls: ToolCall[] = [];

  for (const toolCall of toolsCalled) {
    const args = await parseToolCall(toolCall.name, toolCall.args);
    toolCalls.push({
      id: toolCall.id ?? "",
      name: toolCall.name,
      args,
    });
  }

  const responseToUser = extractUserFacingText(
    response.text,
    toolCalls.map((toolCall) => toolCall.name),
  );

  console.log("Response to user", responseToUser);
  console.log("Tools called", toolsCalled);

  return { responseToUser, toolCalls };
};
