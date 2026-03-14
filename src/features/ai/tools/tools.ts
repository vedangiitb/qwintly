import {
  MESSAGE_TYPES,
  MessageType,
} from "@/features/chat/types/messages.types";
import {
  AskQuestionsToolExecutionContext,
  askQuestionsToolHelper,
} from "./helpers/askQuestions.helper";
import {
  UpdateContextToolExecutionContext,
  updateContextToolHelper,
} from "./helpers/updateContext.helper";
import {
  UpdatePlanToolExecutionContext,
  updatePlanToolHelper,
} from "./helpers/updatePlan.helper";

export const toolCallMap = {
  ASK_QUESTIONS: "ask_questions",
  UPDATE_CONTEXT: "update_context",
  UPDATE_PLAN: "update_plan",
} as const;

export type ToolName = (typeof toolCallMap)[keyof typeof toolCallMap];

export const TOOL_TO_MESSAGE_TYPE: Record<string, MessageType> = {
  [toolCallMap.ASK_QUESTIONS]: MESSAGE_TYPES.QUESTIONS,
  [toolCallMap.UPDATE_PLAN]: MESSAGE_TYPES.PLAN,
};

export const TOOL_TO_DB_TYPE: Record<string, string> = {
  [toolCallMap.ASK_QUESTIONS]: "project_questions",
  [toolCallMap.UPDATE_PLAN]: "project_plan",
};

type ToolHandlerResult = unknown | Promise<unknown>;

export type ToolExecutionContext =
  | AskQuestionsToolExecutionContext
  | UpdateContextToolExecutionContext
  | UpdatePlanToolExecutionContext;

export interface ToolDefinition {
  parse(args: unknown): unknown;
  summarize(args: unknown): unknown;
  handle(args: unknown, context: ToolExecutionContext): ToolHandlerResult;
}

interface ToolHelper<TContext extends ToolExecutionContext> {
  parse(args: unknown): unknown;
  summarize(args: unknown): unknown;
  handle(args: unknown, context: TContext): ToolHandlerResult;
}

export class ToolRegistry {
  constructor(private readonly definitions: Record<string, ToolDefinition>) {}

  get(toolName: string): ToolDefinition | null {
    return this.definitions[toolName] ?? null;
  }

  has(toolName: string): boolean {
    return Boolean(this.definitions[toolName]);
  }
}

const createToolDefinition = <TContext extends ToolExecutionContext>(
  helper: ToolHelper<TContext>,
): ToolDefinition => ({
  parse: (args) => helper.parse(args),
  summarize: (args) => helper.summarize(args),
  handle: (args, context) => helper.handle(args, context as TContext),
});

const askQuestionsToolDefinition =
  createToolDefinition<AskQuestionsToolExecutionContext>(
    askQuestionsToolHelper,
  );

const updateContextToolDefinition =
  createToolDefinition<UpdateContextToolExecutionContext>(
    updateContextToolHelper,
  );

const updatePlanToolDefinition =
  createToolDefinition<UpdatePlanToolExecutionContext>(updatePlanToolHelper);

export const TOOL_REGISTRY: Record<string, ToolDefinition> = {
  [toolCallMap.ASK_QUESTIONS]: askQuestionsToolDefinition,
  [toolCallMap.UPDATE_CONTEXT]: updateContextToolDefinition,
  [toolCallMap.UPDATE_PLAN]: updatePlanToolDefinition,
};

export const toolRegistry = new ToolRegistry(TOOL_REGISTRY);
