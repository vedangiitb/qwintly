import { validateChatId } from "../helpers/validateChatId";
import { ChatRepository } from "../repositories/chat.repository";
import { FetchMessagesResult } from "../../types/chat.types";

interface FetchChatMessagesParams {
  chatId: string;
  limit?: number;
  cursor?: string;
}

export const fetchChatMessages = async (
  { chatId, limit, cursor }: FetchChatMessagesParams,
  token: string,
): Promise<FetchMessagesResult> => {
  const validChatId = validateChatId(chatId);

  if (cursor) {
    const [cursorCreatedAt, cursorId] = cursor.split("|");
    if (!cursorCreatedAt || !cursorId) {
      throw new Error("Invalid cursor format. Expected: created_at|id");
    }
  }

  const chatRepo = new ChatRepository(token);
  const pageSize = limit ?? 20;

  const messages = await chatRepo.fetchChatMessages(validChatId, {
    limit: pageSize,
    cursor,
  });

  return messages;
};
