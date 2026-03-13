import { ChatGoogleGenerativeAI as ChatGoogle } from "@langchain/google-genai";
import { MessagesRepository } from "@/features/chat/server/repositories/messages.repository";
import { CollectedContextRepository } from "@/features/chat/server/repositories/collectedContext.repository";
import { ToolsRepository } from "@/features/ai/repository/tools.repository";
import { UpdatePlanRepository } from "@/features/ai/repository/updatePlan.repository";
import { AskQuestionsRepository } from "../repository/askQuestions.repository";

export interface WebsiteAgentDeps {
  llm: ChatGoogle;
  messageRepo: MessagesRepository;
  collectedContextRepo: CollectedContextRepository;
  toolCallRepo: ToolsRepository;
  updatePlanRepo: UpdatePlanRepository;
  askQuestionsRepo: AskQuestionsRepository;
}
