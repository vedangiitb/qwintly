import { ToolCall } from "@/features/ai/types/tools.types";
import { BaseMessage, AIMessageChunk } from "@langchain/core/messages";
import { ChatGoogleGenerativeAI as ChatGoogle } from "@langchain/google-genai";
import { looksLikeLeakedToolText } from "../flows/aiChatAgent/nodes/generateResponse";
import { toolCallMap } from "../tools/tools";
import { parseToolCall } from "./toolCall.service";

const TOOL_RESPONSE_TEXTS: Record<string, string> = {
  [toolCallMap.UPDATE_PLAN]: "I updated the plan.",
  [toolCallMap.ASK_QUESTIONS]:
    "I need a few clarifications before I can continue.",
};

const extractUserFacingText = (
  responseText: string | undefined,
  toolNames: string[],
): string => {
  if (toolNames.length > 0) {
    return TOOL_RESPONSE_TEXTS[toolNames[0]];
  }
  const trimmedText = responseText?.trim() ?? "";
  if (!trimmedText) {
    return "Failed to generate response. Please try again";
  }

  const looksLikeSerializedToolCall = looksLikeLeakedToolText(responseText);

  if (looksLikeSerializedToolCall) {
    return (
      TOOL_RESPONSE_TEXTS[toolNames[0]] ??
      "Something went wrong. Please try again"
    );
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

export interface StreamChunk {
  type: "text" | "done";
  content?: string;
  toolCalls?: ToolCall[];
  fullText?: string;
}

const extractTextContent = (content: unknown): string => {
  if (typeof content === "string") return content;
  if (Array.isArray(content)) {
    return content
      .map((part) => {
        if (typeof part === "string") return part;
        if (part && typeof part === "object") {
          return (part as any).text ?? "";
        }
        return "";
      })
      .join("");
  }
  return "";
};

export async function* streamLlmCallWithTools(
  llm: ChatGoogle,
  context: BaseMessage[],
  tools: any[],
): AsyncGenerator<StreamChunk, void, unknown> {
  const modelWithTools = llm.bindTools(tools);
  const stream = await modelWithTools.stream(context);

  let message: AIMessageChunk | null = null;

  for await (const chunk of stream) {
    if (!message) {
      message = chunk;
    } else {
      message = message.concat(chunk);
    }

    if (chunk.content) {
      const text = extractTextContent(chunk.content);
      if (text) {
        yield {
          type: "text",
          content: text,
        };
      }
    }
  }

  const toolsCalled = message?.tool_calls ?? [];
  const toolCalls: ToolCall[] = [];

  for (const toolCall of toolsCalled) {
    const args = await parseToolCall(toolCall.name, toolCall.args);
    toolCalls.push({
      id: toolCall.id ?? "",
      name: toolCall.name,
      args,
    });
  }

  const rawText = message ? extractTextContent(message.content) : "";
  const responseToUser = extractUserFacingText(
    rawText,
    toolCalls.map((toolCall) => toolCall.name),
  );

  yield {
    type: "done",
    fullText: responseToUser,
    toolCalls,
  };
}
