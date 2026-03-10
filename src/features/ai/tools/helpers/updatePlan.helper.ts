import {
  INTENT,
  Intent,
  PLAN_STATUS,
  Plan,
  PlanTask,
  TASK_TYPE,
  TaskType,
} from "@/features/ai/types/updatePlan.types";

type UpdatePlanArgs = {
  tasks?: Array<{
    task_id?: unknown;
    task_type?: unknown;
    intent?: unknown;
    description?: unknown;
  }>;
};

type UpdatePlanInput = UpdatePlanArgs | UpdatePlanArgs["tasks"];

export interface UpdatePlanRepositoryPort {
  addPlan(
    tasksDetail: PlanTask[],
    chatId: string,
    messageId: string,
    toolId: string,
  ): Promise<string>;
  fetchPrevPlan(chatId: string): Promise<Plan | null>;
  updateProjectTasksStatus(
    planId: string,
    status: Plan["status"],
  ): Promise<string>;
}

export type UpdatePlanToolExecutionContext = {
  chatId: string;
  messageId: string;
  toolId: string;
  repository: UpdatePlanRepositoryPort;
};

export class UpdatePlanToolHelper {
  private static readonly VALID_TASK_TYPES = Object.values(
    TASK_TYPE,
  ) as TaskType[];
  private static readonly VALID_INTENTS = Object.values(INTENT) as Intent[];

  parse(args: unknown): PlanTask[] {
    console.log("Plan args", args);
    const rawTasks = this.getRawTasks(args);
    console.log("Raw tasks", rawTasks);

    return rawTasks.map((task) => ({
      task_id: typeof task.task_id === "string" ? task.task_id : "",
      task_type: this.normalizeTaskType(task.task_type),
      intent: this.normalizeIntent(task.intent),
      description: typeof task.description === "string" ? task.description : "",
    }));
  }

  summarize(args: unknown): string {
    const tasks = this.parse(args);
    const descriptions = tasks
      .map((task) => task.description.trim())
      .filter(Boolean);

    if (!descriptions.length) return "No plan tasks provided";

    const preview = descriptions.slice(0, 3).join("; ");
    return descriptions.length > 3
      ? `${preview}; +${descriptions.length - 3} more`
      : preview;
  }

  async handle(
    args: unknown,
    context: UpdatePlanToolExecutionContext,
  ): Promise<string> {
    const tasks = this.parse(args);
    try {
      const previousPlan = await this.fetchPreviousPlan(context);
      await this.updatePreviousPendingPlan(previousPlan, context);
    } catch (e) {
      console.error("Failed to update previous plan status", e);
    }

    return context.repository.addPlan(
      tasks,
      context.chatId,
      context.messageId,
      context.toolId,
    );
  }

  private async fetchPreviousPlan(
    context: UpdatePlanToolExecutionContext,
  ): Promise<Plan | null> {
    try {
      return await context.repository.fetchPrevPlan(context.chatId);
    } catch (error) {
      throw new Error(
        `Failed to fetch previous plan for chat ${context.chatId}: ${this.getErrorMessage(error)}`,
      );
    }
  }

  private async updatePreviousPendingPlan(
    previousPlan: Plan | null,
    context: UpdatePlanToolExecutionContext,
  ): Promise<void> {
    if (!previousPlan || previousPlan.status !== PLAN_STATUS.PENDING) {
      return;
    }

    if (!previousPlan.id) {
      throw new Error(
        `Previous pending plan is missing an id for chat ${context.chatId}`,
      );
    }

    try {
      await context.repository.updateProjectTasksStatus(
        previousPlan.id,
        PLAN_STATUS.UPDATED,
      );
    } catch (error) {
      throw new Error(
        `Failed to update previous pending plan ${previousPlan.id}: ${this.getErrorMessage(error)}`,
      );
    }
  }

  private normalizeTaskType(taskType: unknown): TaskType {
    return UpdatePlanToolHelper.VALID_TASK_TYPES.includes(taskType as TaskType)
      ? (taskType as TaskType)
      : TASK_TYPE.UI_TASK;
  }

  private normalizeIntent(intent: unknown): Intent {
    return UpdatePlanToolHelper.VALID_INTENTS.includes(intent as Intent)
      ? (intent as Intent)
      : INTENT.MODIFY_SECTION;
  }

  private getRawTasks(args: unknown): NonNullable<UpdatePlanArgs["tasks"]> {
    const typedArgs = (args ?? {}) as UpdatePlanInput;

    if (Array.isArray(typedArgs)) {
      return typedArgs;
    }

    return Array.isArray(typedArgs.tasks) ? typedArgs.tasks : [];
  }

  private getErrorMessage(error: unknown): string {
    return error instanceof Error ? error.message : "Unknown error";
  }
}

export const updatePlanToolHelper = new UpdatePlanToolHelper();
