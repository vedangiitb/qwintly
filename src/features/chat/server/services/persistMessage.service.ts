import { tokenCounter } from "@/utils/tokenCount";
import { MESSAGE_TYPES, MessageType, Role } from "../../types/messages.types";
import { MessagesRepository } from "../repositories/messages.repository";

interface PersistMessageParams {
  chatId: string;
  content: string;
  role: Role;
  repo: MessagesRepository;
  type?: MessageType;
}

export const persistMessage = async ({
  chatId,
  content,
  role,
  repo,
  type,
}: PersistMessageParams): Promise<string> => {
  const tokenCount = tokenCounter(content);

  const { id } = await repo.insertChatMessage({
    chatId,
    content,
    role,
    type: type || MESSAGE_TYPES.MESSAGE,
    tokenCount,
  });

  if (!id) {
    throw new Error("Failed to persist message");
  }

  return id;
};
