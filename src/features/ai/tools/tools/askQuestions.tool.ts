import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { QuestionSchema } from "../schemas/askQuestions.schema";

export const askQuestionsTool = tool(async ({ questions }) => ({ questions }), {
  name: "ask_questions",
  description:
    "Generate structured multiple-choice clarification questions required to clearly define the user's project requirements.",
  schema: z.object({
    questions: z.array(QuestionSchema).min(1),
  }),
});
