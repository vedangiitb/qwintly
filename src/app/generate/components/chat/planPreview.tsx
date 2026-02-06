import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useChat } from "../../hooks/useChat";

// ---- Types inferred from planSchema ----
// TODO: Replace usage of all the below with plan.interface.ts -> (Update imports everywhere)
type TaskType = "ui_task" | "be_task" | "db_task";

type Intent =
  | "add_page"
  | "add_section"
  | "modify_section"
  | "modify_text_content"
  | "modify_styling"
  | "add_new_service"
  | "modify_service"
  | "connect_ai"
  | "db_connection"
  | "add_new_table"
  | "modify_schema"
  | "modify_table"
  | "add_new_column"
  | "modify_column";

export type PlanTask = {
  task_id: string;
  task_type: TaskType;
  intent: Intent;
  description: string;
  content: Record<string, any>;
  page: string;
  new_feature_name: string;
  feature: string;
  service: string;
  component_id: string;
};

export type PlanOutput = {
  tasks: PlanTask[];
  implemented: boolean;
  newInfo: {
    name: string;
    description: string;
    category: string;
    target_users: string;
  };
};

// ---- Helpers ----

const TASK_TYPE_LABEL: Record<TaskType, string> = {
  ui_task: "UI",
  be_task: "Backend",
  db_task: "Database",
};

const INTENT_LABEL: Record<Intent, string> = {
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

function groupTasksByIntent(tasks: PlanTask[]) {
  return tasks.reduce<Record<string, PlanTask[]>>((acc, task) => {
    if (!acc[task.intent]) acc[task.intent] = [];
    acc[task.intent].push(task);
    return acc;
  }, {});
}

// ---- Main Component ----

export function PlanReview({ plan }: { plan: PlanOutput }) {
  const { approvePlan: onApprove } = useChat();
  console.log(plan);
  if (!plan) return null;
  const groupedTasks = groupTasksByIntent(plan.tasks);
  if (!groupedTasks) return null;

  return (
    <div className="w-full md:max-w-[90%] space-y-2">
      {/* Top: Project Overview */}
      <Card>
        <CardHeader className="px-4">
          <CardTitle className="text-sm">Project Overview</CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-3 text-sm">
          <div className="grid grid-cols-2 gap-x-4 gap-y-1">
            <div>
              <p className="text-xs text-muted-foreground">Name</p>
              <p className="font-medium">{plan.newInfo.name}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Category</p>
              <p className="font-medium">{plan.newInfo.category}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Target Users</p>
              <p className="font-medium">{plan.newInfo.target_users}</p>
            </div>
          </div>

          <div>
            <p className="text-xs text-muted-foreground">Description</p>
            <p className="text-xs text-muted-foreground leading-snug">
              {plan.newInfo.description}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Middle: Tasks */}
      <Card>
        <CardHeader className="px-4">
          <CardTitle className="text-sm">Proposed Changes</CardTitle>
        </CardHeader>

        <CardContent className="px-4 pt-0">
          <div className="space-y-2">
            {Object.entries(groupedTasks).map(([intent, tasks]) => (
              <div key={intent} className="space-y-2">
                {/* Intent header */}
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold">
                    {INTENT_LABEL[intent as Intent]}
                  </h3>
                  <span className="text-xs text-muted-foreground">
                    {tasks.length} changes
                  </span>
                </div>

                {/* Tasks */}
                <div className="space-y-1">
                  {tasks.map((task) => (
                    <div
                      key={task.task_id}
                      className="rounded-md bg-transparent border-l-2 border-muted px-3 py-2"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[11px] font-medium text-muted-foreground">
                          {TASK_TYPE_LABEL[task.task_type]}
                        </span>
                        {task.page && (
                          <span className="text-[11px] text-muted-foreground">
                            • Page: {task.page}
                          </span>
                        )}
                      </div>

                      <p className="text-sm leading-snug">{task.description}</p>

                      {Object.keys(task.content || {}).length > 0 && (
                        <ul className="mt-1 text-xs text-muted-foreground list-disc list-inside">
                          {Object.values(task.content).map((v, i) => (
                            <li key={i}>{String(v)}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Bottom: Feedback & Actions */}
      <Card>
        <CardContent className="px-4 flex justify-end">
          <Button size="sm" onClick={onApprove}>
            Approve Plan
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
