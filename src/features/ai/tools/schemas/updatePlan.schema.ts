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
  ])
  .describe("Specific intent/action represented by the task.");

export const PlanTaskSchema = z.object({
  task_id: z.string().describe("Unique stable identifier for the task."),
  task_type: TaskTypeSchema,
  intent: IntentSchema,
  task: z
    .string()
    .describe("Short human-readable task name/title (e.g., 'Home page hero')."),
  description: z
    .string()
    .describe("Human-readable explanation of what needs to be done."),
});

export const PlanStatusSchema = z
  .enum(["pending", "updated", "implementing", "implemented"])
  .describe("Current lifecycle status of the plan.");

export const PlanSchema = z.object({
  tasks: z.array(PlanTaskSchema).describe("Ordered list of tasks in the plan."),
  status: PlanStatusSchema,
});

export const UpdatePlanSchema = PlanSchema;
