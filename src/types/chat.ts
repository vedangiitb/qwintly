export interface Message {
  id?: string;
  role: "user" | "model";
  content: string;
  createdAt?: string;
}

export interface FetchChatResult {
  messages: Message[] | null;
  error: string | null;
}

export type Role = "user" | "model" | "system";

export interface recentChatInterface {
  id: string;
  title: string;
  updated_at: string;
}
