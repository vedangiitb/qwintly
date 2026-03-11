import { z } from "zod";

export const TaskTypeSchema = z
  .enum(["ui_task", "be_task", "db_task"])
  .describe("Category of work for the task.");

export const IntentSchema = z
  .enum([
    "add_page",
    "add_section",
    "modify_section",
    "modify_text_content",
    "modify_styling",
    "add_new_service",
    "modify_service",
    "connect_ai",
    "db_connection",
    "add_new_table",
    "modify_schema",
    "modify_table",
    "add_new_column",
    "modify_column",
  ])
  .describe("Specific intent/action represented by the task.");

export const PlanTaskSchema = z.object({
  task_id: z
    .string()
    .describe("Unique stable identifier for the task."),
  task_type: TaskTypeSchema,
  intent: IntentSchema,
  description: z
    .string()
    .describe("Human-readable explanation of what needs to be done."),
});

export const PlanStatusSchema = z
  .enum(["pending", "updated", "implemented"])
  .describe("Current lifecycle status of the plan.");

export const PlanSchema = z.object({
  tasks: z
    .array(PlanTaskSchema)
    .describe("Ordered list of tasks in the plan."),
  status: PlanStatusSchema,
});

export const UpdatePlanSchema = PlanSchema;
