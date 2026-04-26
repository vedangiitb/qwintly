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

    defaultAnswer: z
      .union([z.string(), z.array(z.string())])
      .optional()
      .describe(
        "Recommended default answer if the user skips. Must match the question type and be present in options.",
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

    if (data.defaultAnswer === undefined) return;

    if (data.type === "single_select") {
      if (typeof data.defaultAnswer !== "string") {
        ctx.addIssue({
          code: "custom",
          message:
            "defaultAnswer must be a string when question type is 'single_select'.",
        });
        return;
      }

      if (!data.options.includes(data.defaultAnswer)) {
        ctx.addIssue({
          code: "custom",
          message: "defaultAnswer must be one of the provided options.",
        });
      }

      return;
    }

    if (data.type === "multi_select") {
      if (!Array.isArray(data.defaultAnswer)) {
        ctx.addIssue({
          code: "custom",
          message:
            "defaultAnswer must be an array of strings when question type is 'multi_select'.",
        });
        return;
      }

      if (data.defaultAnswer.length === 0) {
        ctx.addIssue({
          code: "custom",
          message:
            "defaultAnswer must be non-empty when question type is 'multi_select'.",
        });
        return;
      }

      const invalid = data.defaultAnswer.filter(
        (value) => typeof value !== "string" || !data.options.includes(value),
      );

      if (invalid.length > 0) {
        ctx.addIssue({
          code: "custom",
          message:
            "Every defaultAnswer value must be a string and present in options.",
        });
      }
    }
  });
