type Questions = Question[];

interface Question {
  id: string;
  question: string;
  type: string;
  options?: string[];
}
