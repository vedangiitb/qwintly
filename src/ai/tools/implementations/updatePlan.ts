import { PlanTask } from "@/app/generate/components/chat/planPreview";
import { Stage } from "@/types/chat";
import { insertDataSupabase } from "../../../../infra/supabase/insertData";
import {
  updateFieldsSupabase,
  updateFieldSupabase,
} from "../../../../infra/supabase/updateField";

export const updatePlan = async ({
  tasks,
  newInfo,
  token,
  userId,
  convId,
}: {
  tasks: PlanTask[];
  newInfo: any;
  token: string;
  userId: string;
  convId: string;
}) => {
  const safeTasks = Array.isArray(tasks) ? tasks : [];

  const taskData = safeTasks.map((task: PlanTask) => ({
    task_id: task.task_id ?? "",
    task_type: task.task_type ?? "",
    intent: task.intent ?? "",
    description: task.description ?? "",
    content: task.content ?? {},
    page: task.page ?? "",
    new_feature_name: task.new_feature_name ?? "",
    feature: task.feature ?? "",
    service: task.service ?? "",
    component_id: task.component_id ?? "",
  }));

  const newInfoData = {
    category: newInfo.category ?? "",
    description: newInfo.description ?? "",
    name: newInfo.name ?? "",
    target_users: newInfo.target_users ?? "",
  };

  const collectedInfoData = {
    name: newInfo.name ?? "",
    description: newInfo.description ?? "",
    category: newInfo.category ?? "",
    target_users: newInfo.target_users ?? "",
  };

  await updateFieldsSupabase(
    convId,
    collectedInfoData,
    "collected_info",
    token,
    "conv_id",
  );

  await insertDataSupabase(
    {
      tasks: taskData,
      conv_id: convId,
      user_id: userId,
      info: newInfoData,
    },
    "task",
    token,
  );
  // TODO: Replace this with updateFieldsSupabase
  await updateFieldSupabase(convId, "stage", "planner", "chats", token);

  return { tasks: taskData, newInfo: newInfoData };
};

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
      console.log(rawTasks);
      throw new Error("Planner returned no valid tasks");
    }

    if (!isValidNewInfo(params.newInfo)) {
      console.log(params.newInfo);
      throw new Error("Planner returned invalid project info");
    }

    // ✅ Only now move to planner stage
    updateProjectStage("planner");

    return {
      tasks: validTasks,
      newInfo: params.newInfo,
    };
  } catch (error) {
    console.error("[PLAN_PARSE_ERROR]", error, params);

    return {
      tasks: [],
      newInfo: null,
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
    ["ui_task", "be_task", "db_task"].includes(task.task_type) &&
    isNonEmptyString(task.intent) &&
    isNonEmptyString(task.description) &&
    typeof task.content === "object"
  );
}

function isValidNewInfo(info: any) {
  return (
    info &&
    isNonEmptyString(info.name) &&
    isNonEmptyString(info.description) &&
    isNonEmptyString(info.category) &&
    isNonEmptyString(info.target_users)
  );
}
