import { WebsiteAgent } from "@/features/ai/flows/aiChatAgent/graph";
import { MessagesRepository } from "../repositories/messages.repository";
import { ROLES } from "../../types/messages.types";
import { persistMessage } from "./persistMessage.service";

interface StreamChatDeps {
  chatId: string;
  userMessage: string;
  messageRepo: MessagesRepository;
  aiAgent: WebsiteAgent;
}

export const streamChatService = async ({
  chatId,
  userMessage,
  messageRepo,
  aiAgent,
}: StreamChatDeps) => {
  try {
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
