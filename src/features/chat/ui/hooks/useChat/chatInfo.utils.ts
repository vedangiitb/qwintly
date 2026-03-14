import { QuestionAnswers } from "@/features/ai/types/askQuestions.types";
import { PLAN_STATUS, Plan } from "@/features/ai/types/updatePlan.types";

export const toQuestionAnswerMap = (questionAnswers: QuestionAnswers[]) =>
  questionAnswers.reduce<Record<string, QuestionAnswers>>((acc, current) => {
    if (current.messageId) acc[current.messageId] = current;
    return acc;
  }, {});

export const toPlanMap = (plans: Plan[]) =>
  plans.reduce<Record<string, Plan>>((acc, current) => {
    if (current.messageId) acc[current.messageId] = current;
    return acc;
  }, {});

export const resolveLatestPlanMessageId = (plans: Plan[]): string | null => {
  const firstNotImplemented = plans.find(
    (plan) => plan.messageId && plan.status !== PLAN_STATUS.IMPLEMENTED,
  );
  if (firstNotImplemented?.messageId) return firstNotImplemented.messageId;

  const latestWithMessageId = plans.find((plan) => plan.messageId);
  return latestWithMessageId?.messageId ?? null;
};
