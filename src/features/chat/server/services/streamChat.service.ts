import { buildWebsiteAgent } from "@/features/ai/factories/buildWebsiteAgent";
import { ROLES } from "../../types/messages.types";
import { MessagesRepository } from "../repositories/messages.repository";
import { createChatSseResponse } from "../helpers/createChatSseResponse";
import { persistMessage } from "./persistMessage.service";
import { checkUserMessageLimit } from "./rateLimit.service";

export const streamChat = async (
  chatId: string,
  userMessage: string,
  token: string,
  userId: string,
) => {
  const messageRepo = new MessagesRepository(token);
  const aiAgent = buildWebsiteAgent(token);

  // 1. Check daily limit
  await checkUserMessageLimit(userId);

  // 2. Persist user message
  const userMessageId = await persistMessage({
    chatId,
    content: userMessage,
    role: ROLES.USER,
    repo: messageRepo,
  });

  const stream = aiAgent.streamAgentFlow(chatId, userMessage, userMessageId);

  return createChatSseResponse({
    stream,
    buildDonePayload: (chunk) => ({
      agentMessageId: chunk.agentMessageId,
      response: chunk.fullText,
      toolCall: chunk.toolCalls?.[0] ?? null,
    }),
  });
};
