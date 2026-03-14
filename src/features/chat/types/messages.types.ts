import { ToolCall, ToolCallStatus } from "../../ai/types/tools.types";

export const ROLES = {
  USER: "user",
  MODEL: "model",
  SYSTEM: "system",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

export const MESSAGE_TYPES = {
  MESSAGE: "message",
  PLAN: "plan",
  QUESTIONS: "questions",
} as const;

export type MessageType = (typeof MESSAGE_TYPES)[keyof typeof MESSAGE_TYPES];

export interface Message {
  id: string;
  content: string;
  role: Role;
  type: MessageType;
  createdAt: string;
}

export interface ChatStreamBody {
  chatId: string;
  message: Message;
}

export interface ChatStreamResult {
  response_to_user: string;
  function_Call: ToolCall | null;
}

export interface RecentMsgContext {
  role: Role;
  content: string;
  type: MessageType;
  toolName: string | null;
  toolSummary: any | null;
  toolStatus: ToolCallStatus | null;
}

export interface InsertMsgPayload {
  chatId: string;
  content: string;
  role: Role;
  type: MessageType;
  tokenCount: number;
}
