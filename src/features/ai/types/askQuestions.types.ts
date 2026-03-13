type QuestionType = "single_select" | "multi_select";

export interface Question {
  id: string;
  question: string;
  type: QuestionType;
  options: string[];
}

export interface UserResponse {
  questionId: string;
  response: string | string[];
}

export interface QuestionAnswers {
  id: string;
  questions: Question[];
  userResponses: UserResponse;
  messageId: string;
  status: QuestionStatus;
}

export const QUESTION_STATUS = {
  PENDING: "pending",
  ANSWERED: "answered",
  SKIPPED: "skipped",
};

export type QuestionStatus =
  (typeof QUESTION_STATUS)[keyof typeof QUESTION_STATUS];
