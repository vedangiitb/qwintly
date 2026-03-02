import { ToolCall } from "@/features/ai/types/tools.types";
import { Message, MESSAGE_TYPES, MessageType } from "@/features/chat/types/messages.types";

const byCreatedAtAsc = (a: Message, b: Message): number => {
  const timeDiff =
    new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
  if (timeDiff !== 0) return timeDiff;
  return a.id.localeCompare(b.id);
};

export const dedupeAndSortMessages = (messages: Message[]): Message[] => {
  const byId = new Map<string, Message>();
  messages.forEach((message) => byId.set(message.id, message));
  return Array.from(byId.values()).sort(byCreatedAtAsc);
};

export const getMessageTypeFromToolCall = (
  toolCall: ToolCall | null,
): MessageType => {
  if (!toolCall) return MESSAGE_TYPES.MESSAGE;
  if (toolCall.name === "ask_questions") return MESSAGE_TYPES.QUESTIONS;
  if (toolCall.name === "update_plan") return MESSAGE_TYPES.PLAN;
  return MESSAGE_TYPES.MESSAGE;
};
