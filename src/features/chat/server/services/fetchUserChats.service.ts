import { ChatRepository } from "../repositories/chat.repository";
import { FetchChatsResult } from "../../types/chat.types";

export const fetchUserChats = (
  {
    limit,
    cursor,
  }: {
    limit?: number;
    cursor?: string;
  },
  token: string,
): Promise<FetchChatsResult> => {
  const chatRepo = new ChatRepository(token);
  const pageSize = limit ?? 10;

  const chats = chatRepo.fetchChats({ limit: pageSize, cursor });

  return chats;
};
