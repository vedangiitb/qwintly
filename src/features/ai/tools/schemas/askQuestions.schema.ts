import { z } from "zod";

export const QuestionSchema = z
  .object({
    id: z
      .string()
      .describe(
        "A unique identifier for the question. Should be short, snake_case, and stable (e.g., 'target_audience', 'budget_range').",
      ),

    question: z
      .string()
      .describe(
        "The actual human-readable question that will be shown to the user.",
      ),

    type: z
      .enum(["single_select", "multi_select"])
      .describe(
        "The type of input expected from the user. 'single_select' for choosing one option, 'multi_select' for choosing multiple options.",
      ),

    options: z
      .array(z.string())
      .min(1)
      .describe(
        "List of selectable options. Required for all questions.",
      ),
  })
  .superRefine((data, ctx) => {
    if (!data.options || data.options.length === 0) {
      ctx.addIssue({
        code: "custom",
        message:
          "Options are required when question type is 'single_select' or 'multi_select'.",
      });
    }
  });
