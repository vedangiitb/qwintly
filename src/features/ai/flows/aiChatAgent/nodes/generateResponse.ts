import { ToolsRepository } from "@/features/ai/repository/tools.repository";
import {
  invokeAgentOnce,
  persistAgentResult,
} from "@/features/ai/services/agentCall.service";
import { ToolCall } from "@/features/ai/types/tools.types";
import { askQuestionsTool } from "@/features/ai/tools/tools/askQuestions.tool";
import { updatePlanTool } from "@/features/ai/tools/tools/updatePlan.tool";
import { MessagesRepository } from "@/features/chat/server/repositories/messages.repository";
import { BaseMessage, HumanMessage } from "@langchain/core/messages";
import { ChatGoogleGenerativeAI as ChatGoogle } from "@langchain/google-genai";

const AI_CHAT_AGENT_TOOLS = [updatePlanTool, askQuestionsTool] as const;
type ToolRepositoryResolver = (toolName: string) => unknown;

type GenerateAiResponseResult = Awaited<ReturnType<typeof persistAgentResult>>;

const MAX_RETRY_ATTEMPTS = 2;

const TOOL_LEAK_PATTERNS: RegExp[] = [
  /\btool_code\b/i,
  /\bdefault_api\b/i,
  /\bdefault_api\./i,
  /\b(update_plan|ask_questions|update_context)\b/i,
];

const looksLikeLeakedToolText = (text: string | null | undefined): boolean => {
  const trimmed = text?.trim();
  if (!trimmed) return false;
  return TOOL_LEAK_PATTERNS.some((pattern) => pattern.test(trimmed));
};

const buildRetryPrompt = (leakedText: string) =>
  [
    "Your previous assistant output included tool-calling code/internals (e.g. `tool_code`, `default_api.*`).",
    "Regenerate your answer",
    "Do not print tool call code, tool schemas, or `default_api` calls. If you need tools, call them via tool calls, not in plain text.",
    "",
    "Previous output (do not repeat):",
    leakedText,
  ].join("\n");

export const generateAiResponse = async (
  llm: ChatGoogle,
  context: BaseMessage[],
  chatId: string,
  toolCallRepo: ToolsRepository,
  messagesRepo: MessagesRepository,
  resolveToolRepository?: ToolRepositoryResolver,
): Promise<GenerateAiResponseResult> => {
  console.log("Generating AI Response");
  let lastResponseToUser = "";
  let lastToolCalls: ToolCall[] = [];

  for (let attempt = 0; attempt <= MAX_RETRY_ATTEMPTS; attempt++) {
    const attemptContext =
      attempt === 0
        ? context
        : [
            ...context,
            new HumanMessage(buildRetryPrompt(lastResponseToUser)),
          ];

    const { responseToUser, toolCalls } = await invokeAgentOnce(
      llm,
      [...AI_CHAT_AGENT_TOOLS],
      attemptContext,
    );

    lastResponseToUser = responseToUser;
    lastToolCalls = toolCalls;

    const shouldRetry = looksLikeLeakedToolText(responseToUser) && !toolCalls.length;

    if (!shouldRetry) break;

    console.warn(
      `Detected leaked tool-call text in user response (attempt ${attempt + 1}/${
        MAX_RETRY_ATTEMPTS + 1
      }) for chat ${chatId}; retrying.`,
    );
  }

  const { aiMessageId, responseToUser, toolCalls } = await persistAgentResult(
    lastResponseToUser,
    lastToolCalls,
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
