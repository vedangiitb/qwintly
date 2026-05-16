"use client";

import { PLAN_STATUS, Plan } from "@/features/ai/types/updatePlan.types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { useChat } from "../hooks/useChat";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useGenerate } from "@/features/generate/ui/hooks/useGenerate";

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
  const { approvePlan: onApprove } = useChat();
  const { isSessionRunning } = useGenerate();
  const router = useRouter();
  const isUpdatedPlan = plan?.status === PLAN_STATUS.UPDATED;
  const [isExpanded, setIsExpanded] = useState(!isUpdatedPlan);
  const [expandedTaskMap, setExpandedTaskMap] = useState<Record<string, boolean>>(
    {},
  );

  useEffect(() => {
    setIsExpanded(!isUpdatedPlan);
  }, [isUpdatedPlan, plan?.id, plan?.messageId]);

  if (!plan) {
    return (
      <Card className="w-full md:max-w-[90%]">
        <CardContent className="pt-6 text-sm text-muted-foreground">
          {fallbackText || "Plan details are not available for this message."}
        </CardContent>
      </Card>
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
        typeof (error as Error & { statusCode?: number })?.statusCode === "number"
          ? (error as Error & { statusCode?: number }).statusCode
          : undefined;

      if (statusCode === 403) {
        toast.error("You haven't added an API key. Redirecting to BYOK…");
        router.push("/byok");
        return;
      }

      toast.error(message);
    }
  };

  return (
    <div className="w-full md:max-w-[90%] space-y-2">
      <Card>
        <CardHeader className="px-4">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <CardTitle className="text-sm">Plan</CardTitle>
              <p className="text-xs text-muted-foreground">
                {taskCount} tasks • {intentCount}{" "}
                {intentCount === 1 ? "group" : "groups"}
              </p>
            </div>
            <span
              className={cn(
                "rounded-full px-2.5 py-1 text-[11px] font-medium uppercase tracking-wide",
                isUpdatedPlan
                  ? "bg-amber-100 text-amber-800"
                  : "bg-emerald-100 text-emerald-800",
              )}
            >
              {plan.status}
            </span>
          </div>
        </CardHeader>

        <CardContent className="px-4 pt-0 pb-4">
          {isUpdatedPlan ? (
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs text-muted-foreground">
                Draft plan (updated). Expand to review tasks.
              </p>

              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsExpanded((current) => !current)}
              >
                {isExpanded ? "Collapse" : "Expand"}
              </Button>
            </div>
          ) : null}

          {isExpanded ? (
            <div className="space-y-3 pt-4">
              {Object.entries(groupedTasks).map(([intent, tasks]) => (
                <div key={intent} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      {INTENT_LABEL[intent as Plan["tasks"][number]["intent"]]}
                    </h3>
                    <span className="text-xs text-muted-foreground">
                      {tasks.length}
                    </span>
                  </div>

                  <div className="overflow-hidden rounded-lg border bg-background">
                    {tasks.map((task) => (
                      <div
                        key={task.task_id}
                        className="border-b last:border-b-0"
                      >
                        <button
                          type="button"
                          className={cn(
                            "w-full px-3 py-2 text-left transition-colors hover:bg-muted/40",
                            expandedTaskMap[task.task_id] ? "bg-muted/20" : "",
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
                              <p className="truncate text-sm font-medium leading-snug">
                                {task.task || task.task_id}
                              </p>
                            </div>

                            <div className="flex items-center gap-2">
                              <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                                {TASK_TYPE_LABEL[task.task_type]}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {expandedTaskMap[task.task_id]
                                  ? "Hide"
                                  : "Details"}
                              </span>
                            </div>
                          </div>
                        </button>

                        {expandedTaskMap[task.task_id] ? (
                          <div className="px-2 py-1">
                            <div>
                              <p className="text-sm leading-snug text-muted-foreground">
                                {task.description}
                              </p>
                            </div>
                          </div>
                        ) : null}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : null}
        </CardContent>
      </Card>

       {shouldShowApprove ? (
         <Card>
           <CardContent className="flex justify-end px-4">
             <Button size="sm" onClick={handleApprove} disabled={isSessionRunning}>
               Approve Plan
             </Button>
           </CardContent>
         </Card>
       ) : null}
    </div>
  );
}
