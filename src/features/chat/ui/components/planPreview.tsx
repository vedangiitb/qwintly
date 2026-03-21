"use client";

import { PLAN_STATUS, Plan } from "@/features/ai/types/updatePlan.types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
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
  add_new_service: "Add Service",
  modify_service: "Modify Service",
  connect_ai: "Connect AI",
  db_connection: "DB Connection",
  add_new_table: "Add Table",
  modify_schema: "Modify Schema",
  modify_table: "Modify Table",
  add_new_column: "Add Column",
  modify_column: "Modify Column",
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
  const isUpdatedPlan = plan?.status === PLAN_STATUS.UPDATED;
  const [isExpanded, setIsExpanded] = useState(!isUpdatedPlan);

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

  return (
    <div className="w-full md:max-w-[90%] space-y-2">
      <Card>
        <CardHeader className="px-4">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <CardTitle className="text-sm">Proposed Changes</CardTitle>
              <p className="text-xs text-muted-foreground">
                {taskCount} tasks across {intentCount}{" "}
                {intentCount === 1 ? "area" : "areas"}
              </p>
            </div>
            <span
              className={cn(
                "rounded-full px-2.5 py-1 text-[11px] font-medium uppercase",
                isUpdatedPlan
                  ? "bg-amber-100 text-amber-800"
                  : "bg-emerald-100 text-emerald-800",
              )}
            >
              {plan.status}
            </span>
          </div>
        </CardHeader>

        <CardContent className="px-4 pt-0">
          {isUpdatedPlan ? (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                This plan is part of an active draft cycle. Expand it only when
                you need to inspect the full task list.
              </p>

              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsExpanded((current) => !current)}
              >
                {isExpanded ? "Hide details" : "Show details"}
              </Button>
            </div>
          ) : null}

          {isExpanded ? (
            <div className="space-y-2 pt-3">
              {Object.entries(groupedTasks).map(([intent, tasks]) => (
                <div key={intent} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold">
                      {INTENT_LABEL[intent as Plan["tasks"][number]["intent"]]}
                    </h3>
                    <span className="text-xs text-muted-foreground">
                      {tasks.length} changes
                    </span>
                  </div>

                  <div className="space-y-1">
                    {tasks.map((task) => (
                      <div
                        key={task.task_id}
                        className="rounded-md bg-transparent border-l-2 border-muted px-3 py-2"
                      >
                        <div className="mb-1 flex items-center gap-2">
                          <span className="text-[11px] font-medium text-muted-foreground">
                            {TASK_TYPE_LABEL[task.task_type]}
                          </span>
                        </div>

                        <p className="text-sm leading-snug">
                          {task.description}
                        </p>
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
            <Button size="sm" onClick={() => onApprove(plan.id)}>
              Approve Plan
            </Button>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
