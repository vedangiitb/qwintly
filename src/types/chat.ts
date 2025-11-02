export interface Message {
  id?: string;
  role: "user" | "assistant";
  content: string;
  createdAt?: string;
}

export interface FetchChatResult {
  messages: Message[] | null;
  error: string | null;
}

export type Role = "user" | "assistant" | "system";
