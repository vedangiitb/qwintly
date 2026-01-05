type Questions = Question[];

type Question = {
  id: string;
  question: string;
  type: "text" | "single_select" | "multi_select";
  options?: string[];
  answer_default?: string;
};
