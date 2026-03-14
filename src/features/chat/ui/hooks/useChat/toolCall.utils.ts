import { ToolCall } from "@/features/ai/types/tools.types";

export const isSupportedUiToolCall = (toolCall: ToolCall): boolean =>
  toolCall.name === "ask_questions" || toolCall.name === "update_plan";
