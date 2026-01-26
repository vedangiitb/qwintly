import { PlanTask } from "@/app/generate/components/chat/planPreview";
import { Stage } from "@/types/chat";

export const updatePlan = async () => {};

export const updatePlanClient = async (
  params: any,
  updateProjectStage: (stage: Stage) => void,
) => {
  try {
    if (!params || typeof params !== "object") {
      throw new Error("Invalid planner response: empty payload");
    }

    const rawTasks = Array.isArray(params.tasks) ? params.tasks : [];
    const validTasks = rawTasks.filter(isValidTask);

    if (validTasks.length === 0) {
      throw new Error("Planner returned no valid tasks");
    }

    if (!isValidNewInfo(params.newInfo)) {
      throw new Error("Planner returned invalid project info");
    }

    // ✅ Only now move to planner stage
    updateProjectStage("planner");

    return {
      tasks: validTasks,
      collectedInfo: params.newInfo,
    };
  } catch (error) {
    console.error("[PLAN_PARSE_ERROR]", error, params);

    return {
      tasks: [],
      collectedInfo: null,
      error: "Failed to generate a valid plan. Please try again.",
    };
  }
};

function isNonEmptyString(value: any): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isValidTask(task: any): task is PlanTask {
  return (
    task &&
    isNonEmptyString(task.task_id) &&
    ["ui_task", "be_task", "db_task"].includes(task.task_type) &&
    isNonEmptyString(task.intent) &&
    isNonEmptyString(task.description) &&
    typeof task.content === "object" &&
    isNonEmptyString(task.page) &&
    isNonEmptyString(task.new_feature_name) &&
    isNonEmptyString(task.feature) &&
    isNonEmptyString(task.service) &&
    isNonEmptyString(task.component_id)
  );
}

function isValidNewInfo(info: any) {
  return (
    info &&
    isNonEmptyString(info.name) &&
    isNonEmptyString(info.description) &&
    isNonEmptyString(info.category) &&
    isNonEmptyString(info.targetUsers)
  );
}
