import { Tool } from "@google/genai";
import { askQuestions } from "../schemas/askQuestion.schema";

export const starterTools: Tool[] = [
  {
    functionDeclarations: [askQuestions],
  },
];
