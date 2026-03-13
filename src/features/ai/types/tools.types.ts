import { TaskType } from "./updatePlan.types";

export const TOOL_CALL_STATUS = {
  PENDING: "pending",
  SUCCESS: "success",
  FAILED: "failed",
};

export type ToolCallStatus =
  (typeof TOOL_CALL_STATUS)[keyof typeof TOOL_CALL_STATUS];

export interface ToolCall {
  id: string;
  name: string;
  args: any;
}

export interface FunctionExecutionResult {
  status: ToolCallStatus;
  result: any;
  resultSummary: string;
}

export type ExecTaskSummary = {
  task_type: TaskType;
  description: string;
};

export type ExecPlanSummary = {
  planDescription: string;
  tasks: ExecTaskSummary[];
};

export type NewToolCallInsert = {
  convId: string;
  messageId: string;
  toolName: string;
  args: any;
  summary: any;
};
