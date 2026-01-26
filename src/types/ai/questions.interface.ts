type Questions = Question[];

type Question = {
  id: string;
  question: string;
  type: QuestionType;
  options?: string[];
  answer_default?: string;
};

type QuestionType = "text" | "single_select" | "multi_select";

type QuestionAnswers = {
  question: string;
  type: QuestionType;
  options?: string[];
  chosenAnswer: string;
};
