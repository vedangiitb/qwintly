import { Question } from "@/features/ai/types/askQuestions.types";

type QuestionType = Question["type"];

type AskQuestionsArgs = {
  questions?: Array<{
    id?: unknown;
    question?: unknown;
    type?: unknown;
    options?: unknown;
  }>;
};

type AskQuestionsInput = AskQuestionsArgs | AskQuestionsArgs["questions"];

export interface AskQuestionsRepositoryPort {
  addProjectQuestions(
    convId: string,
    messageId: string,
    toolId: string,
    questions: Question[],
  ): Promise<string>;
}

export type AskQuestionsToolExecutionContext = {
  chatId: string;
  messageId: string;
  toolId: string;
  repository: AskQuestionsRepositoryPort;
};

export class AskQuestionsToolHelper {
  private static readonly VALID_TYPES: QuestionType[] = [
    "single_select",
    "multi_select",
  ];

  parse(args: unknown): Question[] {
    console.log("Question args", args);
    const rawQuestions = this.getRawQuestions(args);
    console.log("Raw questions", rawQuestions);

    return rawQuestions.map((question) => {
      const type = this.normalizeType(question.type);

      const normalizedQuestion: Question = {
        id: typeof question.id === "string" ? question.id : "",
        question:
          typeof question.question === "string" ? question.question : "",
        type,
        options: [],
      };

      normalizedQuestion.options = Array.isArray(question.options)
        ? question.options.filter(
            (option): option is string => typeof option === "string",
          )
        : [];
      console.log("Normalized question", normalizedQuestion);

      return normalizedQuestion;
    });
  }

  summarize(args: unknown): string {
    const questions = this.parse(args);
    const prompts = questions
      .map((item) => item.question.trim())
      .filter(Boolean);

    if (!prompts.length) return "No questions provided";

    const preview = prompts.slice(0, 3).join("; ");
    return prompts.length > 3
      ? `${preview}; +${prompts.length - 3} more`
      : preview;
  }

  async handle(
    args: unknown,
    context: AskQuestionsToolExecutionContext,
  ): Promise<string> {
    const questions = this.parse(args);

    return context.repository.addProjectQuestions(
      context.chatId,
      context.messageId,
      context.toolId,
      questions,
    );
  }

  private normalizeType(type: unknown): QuestionType {
    return AskQuestionsToolHelper.VALID_TYPES.includes(type as QuestionType)
      ? (type as QuestionType)
      : "single_select";
  }

  private getRawQuestions(
    args: unknown,
  ): NonNullable<AskQuestionsArgs["questions"]> {
    const typedArgs = (args ?? {}) as AskQuestionsInput;

    if (Array.isArray(typedArgs)) {
      return typedArgs;
    }

    return Array.isArray(typedArgs.questions) ? typedArgs.questions : [];
  }
}

export const askQuestionsToolHelper = new AskQuestionsToolHelper();
