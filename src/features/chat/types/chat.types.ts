import { CollectedContext } from "@/features/chat/types/collectedContext.types";
import { Message } from "./messages.types";

export interface Chat {
  id: string;
  title: string;
}

export interface FetchChatsResult {
  chats: Chat[];
  nextCursor: string | null;
}

export interface ChatMetadata {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  collectedContext: CollectedContext;
}

export interface FetchMessagesResult {
  messages: Message[];
  nextCursor: string | null;
}
