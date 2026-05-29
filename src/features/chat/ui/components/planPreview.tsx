"use client";

import { Button } from "@/components/ui/button";
import { PLAN_STATUS, Plan } from "@/features/ai/types/updatePlan.types";
import { useGenerate } from "@/features/generate/ui/hooks/useGenerate";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useChat } from "../hooks/useChat";

const TASK_TYPE_LABEL: Record<Plan["tasks"][number]["task_type"], string> = {
  ui_task: "UI",
  be_task: "Backend",
  db_task: "Database",
};

const INTENT_LABEL: Record<Plan["tasks"][number]["intent"], string> = {
  add_page: "Add Page",
  add_section: "Add Section",
  modify_section: "Modify Section",
  modify_text_content: "Modify Content",
  modify_styling: "Modify Styling",
};

function groupTasksByIntent(tasks: Plan["tasks"]) {
  return tasks.reduce<Record<string, Plan["tasks"]>>((acc, task) => {
    if (!acc[task.intent]) acc[task.intent] = [];
    acc[task.intent].push(task);
    return acc;
  }, {});
}

export function PlanReview({
  plan,
  fallbackText,
}: {
  plan?: Plan;
  fallbackText?: string;
}) {
  const { approvePlan: onApprove, isGeneratingResponse } = useChat();
  const { isSessionRunning } = useGenerate();
  const router = useRouter();
  const isUpdatedPlan = plan?.status === PLAN_STATUS.UPDATED;
  const [isExpanded, setIsExpanded] = useState(!isUpdatedPlan);
  const [expandedTaskMap, setExpandedTaskMap] = useState<
    Record<string, boolean>
  >({});

  useEffect(() => {
    setIsExpanded(!isUpdatedPlan);
  }, [isUpdatedPlan, plan?.id, plan?.messageId]);

  if (!plan) {
    return (
      <div className="w-full md:max-w-[95%] rounded-3xl border border-stone-200/35 bg-white/35 p-5 shadow-[0_8px_30px_rgba(0,0,0,0.01)] backdrop-blur-md dark:border-stone-800/35 dark:bg-stone-900/35">
        <p className="text-xs leading-relaxed text-stone-500 dark:text-stone-400 select-none">
          {fallbackText || "Plan details are not available for this message."}
        </p>
      </div>
    );
  }

  const groupedTasks = groupTasksByIntent(plan.tasks);
  const intentCount = Object.keys(groupedTasks).length;
  const taskCount = plan.tasks.length;
  const shouldShowApprove = plan?.status === PLAN_STATUS.PENDING;

  const handleApprove = async () => {
    if (isSessionRunning) return;
    try {
      await onApprove(plan.id);
    } catch (error) {
      const message =
        error instanceof Error && error.message.trim()
          ? error.message
          : "Failed to approve plan.";

      const statusCode =
        typeof (error as Error & { statusCode?: number })?.statusCode ===
        "number"
          ? (error as Error & { statusCode?: number }).statusCode
          : undefined;

      if (statusCode === 403) {
        toast.error("You haven't added an API key. Redirecting to BYOK…");
        router.push("/byok");
        return;
      }

      if (statusCode === 429) {
        toast.error("Weekly limit exhausted. Redirecting to BYOK...");
        router.push("/byok");
        return;
      }

      toast.error(message);
    }
  };

  return (
    <div className="w-full md:max-w-[95%] space-y-2">
      <div className="rounded-3xl border border-stone-200/35 bg-white/35 dark:border-stone-800/35 dark:bg-stone-900/35 shadow-[0_8px_30px_rgba(0,0,0,0.01)] backdrop-blur-md overflow-hidden p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="space-y-0.5">
            <h2 className="text-sm font-semibold tracking-tight text-stone-900 dark:text-stone-100">
              AI Implementation Plan
            </h2>
            <p className="text-xs text-stone-500 dark:text-stone-400 font-medium">
              {taskCount} tasks • {intentCount}{" "}
              {intentCount === 1 ? "group" : "groups"}
            </p>
          </div>
          <span
            className={cn(
              "rounded-full px-2.5 py-1 text-[9px] font-semibold uppercase tracking-wider shadow-2xs",
              isUpdatedPlan
                ? "bg-amber-100/80 text-amber-800 dark:bg-amber-950/30 dark:text-amber-300"
                : plan.status === PLAN_STATUS.IMPLEMENTED
                  ? "bg-emerald-100/80 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-300"
                  : "bg-teal-100/80 text-teal-800 dark:bg-teal-950/30 dark:text-teal-300",
            )}
          >
            {plan.status}
          </span>
        </div>

        {isUpdatedPlan ? (
          <div className="flex items-center justify-between gap-3 bg-stone-100/50 dark:bg-stone-950/20 p-2.5 rounded-xl border border-stone-200/35 dark:border-stone-800/35 mb-4">
            <p className="text-xs text-stone-500 dark:text-stone-400">
              Draft plan (updated). Expand to review tasks.
            </p>

            <Button
              size="sm"
              variant="outline"
              className="rounded-full h-8 px-4 border-stone-200/50 hover:bg-stone-100 dark:border-stone-800/50 dark:hover:bg-stone-900 text-xs font-medium"
              onClick={() => setIsExpanded((current) => !current)}
            >
              {isExpanded ? "Collapse" : "Expand"}
            </Button>
          </div>
        ) : null}

        {isExpanded ? (
          <div className="space-y-4 pt-2">
            {Object.entries(groupedTasks).map(([intent, tasks]) => (
              <div key={intent} className="space-y-2">
                <div className="flex items-center justify-between px-1">
                  <h3 className="text-[10px] font-semibold uppercase tracking-wider text-stone-400 dark:text-stone-500">
                    {INTENT_LABEL[intent as Plan["tasks"][number]["intent"]]}
                  </h3>
                  <span className="text-xs text-stone-450 font-medium">
                    {tasks.length}
                  </span>
                </div>

                <div className="overflow-hidden rounded-xl border border-stone-200/30 bg-white/20 dark:border-stone-800/30 dark:bg-stone-950/15">
                  {tasks.map((task) => (
                    <div
                      key={task.task_id}
                      className="border-b border-stone-200/20 dark:border-stone-800/20 last:border-b-0"
                    >
                      <button
                        type="button"
                        className={cn(
                          "w-full px-4 py-3 text-left transition-all duration-300 hover:bg-stone-900/5 dark:hover:bg-white/5",
                          expandedTaskMap[task.task_id]
                            ? "bg-stone-900/5 dark:bg-white/5"
                            : "",
                        )}
                        onClick={() =>
                          setExpandedTaskMap((current) => ({
                            ...current,
                            [task.task_id]: !current[task.task_id],
                          }))
                        }
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="min-w-0">
                            <p className="truncate text-xs font-semibold leading-normal text-stone-850 dark:text-stone-150">
                              {task.task || task.task_id}
                            </p>
                          </div>

                          <div className="flex items-center gap-3">
                            <span className="rounded-full bg-stone-100 dark:bg-stone-800 px-2.5 py-0.5 text-[9px] font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wide">
                              {TASK_TYPE_LABEL[task.task_type]}
                            </span>
                            <span className="text-[11px] text-stone-400 font-medium hover:text-stone-600 dark:hover:text-stone-200 transition-colors">
                              {expandedTaskMap[task.task_id]
                                ? "Hide"
                                : "Details"}
                            </span>
                          </div>
                        </div>
                      </button>

                      {expandedTaskMap[task.task_id] ? (
                        <div className="px-4 pb-3 pt-1 bg-stone-100/20 dark:bg-stone-950/10">
                          <p className="text-xs leading-relaxed text-stone-500 dark:text-stone-400">
                            {task.description}
                          </p>
                        </div>
                      ) : null}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : null}

        {shouldShowApprove ? (
          <div className="flex justify-end pt-4 mt-4 border-t border-stone-200/30 dark:border-stone-800/30">
            <Button
              size="sm"
              onClick={handleApprove}
              disabled={isSessionRunning || isGeneratingResponse}
              className="rounded-full px-5 h-9 font-medium active:scale-[0.98] transition-all bg-stone-900 hover:bg-stone-800 dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-stone-200 cursor-pointer"
            >
              Approve Implementation Plan
            </Button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
