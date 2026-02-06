import { PlanTask } from "@/types/ai/plan.interface";

export const startGen = async (
  chatId: string,
  tasks: PlanTask[],
  newInfo: CollectedInfo,
) => {
  // client component
  try {
    // TODO: Update with fetchUtil
    await fetch("/api/generate/publish", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chatId,
        tasks,
        newInfo,
      }),
    });
  } catch (e: any) {
    console.error("startGen error", e);
    return false;
  }
};
