export interface Message {
  id?: string;
  role: "user" | "assistant";
  content: string | Questions;
  stage?: Stage;
  createdAt?: string;
  msgType: string;
}

export interface FetchChatResult {
  messages: Message[] | null;
  error: string | null;
}

export type Role = "user" | "assistant" | "system";

export interface recentChatInterface {
  id: string;
  title: string;
  updated_at: string;
}

export type Stage = "init" | "questioner" | "planner" | "executer";
