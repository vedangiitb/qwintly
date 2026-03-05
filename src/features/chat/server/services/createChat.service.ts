import { llm } from "@/features/ai/core/llm";
import { simpleLLMCall } from "@/features/ai/services/llm.service";
import {
  HumanMessage,
  SystemMessage,
  BaseMessage,
} from "@langchain/core/messages";
import { ChatRepository } from "../repositories/chat.repository";

type ChatId = string;

const MAX_TITLE_LENGTH = 80;
const TITLE_WORD_LIMIT = 6;

export const createChat = async (
  prompt: string,
  token: string,
): Promise<ChatId> => {
  if (!prompt?.trim()) {
    throw new Error("Prompt cannot be empty when creating a chat");
  }

  if (!token) {
    throw new Error("Auth token is required to create a chat");
  }

  const title = await getTitle(prompt);
  const chatRepo = new ChatRepository(token);

  try {
    const { id } = await chatRepo.createChat({ title });

    if (!id) {
      throw new Error("Chat creation failed: repository returned empty id");
    }

    return id;
  } catch (error) {
    console.error("createChat failed", error);
    throw new Error("Failed to create chat");
  }
};

const fallbackTitleFromPrompt = (prompt: string): string => {
  const cleaned = prompt.replace(/\s+/g, " ").trim();

  if (!cleaned) return "New Chat";

  const words = cleaned.split(" ").slice(0, TITLE_WORD_LIMIT);

  return words.join(" ").slice(0, MAX_TITLE_LENGTH);
};

const normalizeTitle = (title: unknown): string => {
  if (typeof title !== "string") return "";

  return title
    .replace(/[^\w\s]/g, "") // remove punctuation
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, MAX_TITLE_LENGTH);
};

const getTitle = async (prompt: string): Promise<string> => {
  const fallback = fallbackTitleFromPrompt(prompt);

  try {
    const messages: BaseMessage[] = [
      new SystemMessage("Generate a short 4-6 word title. No punctuation."),
      new HumanMessage(prompt),
    ];

    const agent = llm();

    const response = await simpleLLMCall(agent, messages);

    const normalized = normalizeTitle(response);

    if (!normalized) {
      return fallback;
    }

    return normalized;
  } catch (error) {
    console.error("Title generation failed", error);
    return fallback;
  }
};
