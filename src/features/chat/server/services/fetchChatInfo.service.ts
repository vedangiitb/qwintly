import { validateChatId } from "../helpers/validateChatId";
import { QuestionAnswers } from "../../../ai/types/askQuestions.types";
import { Plan } from "../../../ai/types/updatePlan.types";
import { AskQuestionsRepository } from "@/features/ai/repository/askQuestions.repository";
import { UpdatePlanRepository } from "@/features/ai/repository/updatePlan.repository";
import { SitesRepository } from "../repositories/sites.repository";
import { ChatRepository } from "../repositories/chat.repository";

interface ChatInfoResponse {
  questionAnswers: QuestionAnswers[];
  plans: Plan[];
  siteUrl: string;
  isGenerating: boolean;
}

interface ChatInfoRepositories {
  questionsRepo: Pick<AskQuestionsRepository, "fetchQuestionsByChatId">;
  plansRepo: Pick<UpdatePlanRepository, "fetchPlansByChatId">;
  sitesRepo: Pick<SitesRepository, "fetchSite">;
  chatsRepo: Pick<ChatRepository, "isGenerating">;
}

const createChatInfoRepositories = (token: string): ChatInfoRepositories => ({
  questionsRepo: new AskQuestionsRepository(token),
  plansRepo: new UpdatePlanRepository(token),
  sitesRepo: new SitesRepository(token),
  chatsRepo: new ChatRepository(token),
});

export const fetchChatInfo = async (
  chatId: string,
  token: string,
  repositories: ChatInfoRepositories = createChatInfoRepositories(token),
): Promise<ChatInfoResponse> => {
  const validChatId = validateChatId(chatId);
  const { questionsRepo, plansRepo, sitesRepo, chatsRepo } = repositories;

  const [questionAnswers, plans, siteUrl, isGenerating] = await Promise.all([
    questionsRepo.fetchQuestionsByChatId(validChatId),
    plansRepo.fetchPlansByChatId(validChatId),
    sitesRepo.fetchSite(validChatId),
    chatsRepo.isGenerating(validChatId),
  ]);

  return { questionAnswers, plans, siteUrl, isGenerating };
};
