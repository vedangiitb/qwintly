import { WebsiteAgent } from "@/features/ai/flows/aiChatAgent/graph";
import { ROLES } from "../../types/messages.types";
import { MessagesRepository } from "../repositories/messages.repository";
import { persistMessage } from "./persistMessage.service";
import { checkUserMessageLimit } from "./rateLimit.service";

interface StreamChatDeps {
  chatId: string;
  userId: string;
  userMessage: string;
  messageRepo: MessagesRepository;
  aiAgent: WebsiteAgent;
}

export const streamChatService = async ({
  chatId,
  userId,
  userMessage,
  messageRepo,
  aiAgent,
}: StreamChatDeps) => {
  try {
    /*
     * Check if user is within daily limits
     */
    await checkUserMessageLimit(userId);

    /*
     * Persist user message
     */
    const userMessageId = await persistMessage({
      chatId,
      content: userMessage,
      role: ROLES.USER,
      repo: messageRepo,
    });

    /*
     * Run AI Flow
     */
    const { aiResponse, agentMessageId, uiToolResponse } =
      await aiAgent.runAgentFlow(chatId, userMessage, userMessageId);

    if (!aiResponse && !uiToolResponse) {
      throw new Error("AI returned empty response");
    }

    return {
      agentMessageId: agentMessageId,
      response: aiResponse,
      toolCall: uiToolResponse ?? null,
    };
  } catch (error) {
    console.error("streamChatService failed:", error);
    throw error;
  }
};
