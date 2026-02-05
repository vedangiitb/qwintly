import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
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
    targetUsers: string;
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
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Left: Project Overview */}
      <Card className="md:col-span-1 h-fit sticky top-6">
        <CardHeader>
          <CardTitle>📌 Project Overview</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <p className="text-sm text-muted-foreground">Name</p>
            <p className="font-medium">{plan.newInfo.name}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Category</p>
            <p className="font-medium">{plan.newInfo.category}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Target Users</p>
            <p className="font-medium">{plan.newInfo.targetUsers}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Description</p>
            <p className="text-sm">{plan.newInfo.description}</p>
          </div>
        </CardContent>
      </Card>

      {/* Right: Tasks */}
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>🧠 Proposed Changes</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[500px] pr-4">
            <Accordion type="multiple" className="space-y-4">
              {Object.entries(groupedTasks).map(([intent, tasks]) => (
                <AccordionItem key={intent} value={intent}>
                  <AccordionTrigger>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">
                        {INTENT_LABEL[intent as Intent]}
                      </span>
                      <Badge variant="secondary">{tasks.length}</Badge>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="space-y-3">
                    {tasks.map((task) => (
                      <Card key={task.task_id} className="border-muted">
                        <CardContent className="pt-4 space-y-2">
                          <div className="flex items-center gap-2">
                            <Badge>{TASK_TYPE_LABEL[task.task_type]}</Badge>
                            {task.page && (
                              <Badge variant="outline">Page: {task.page}</Badge>
                            )}
                          </div>
                          <p className="font-medium">{task.description}</p>
                          {Object.keys(task.content || {}).length > 0 && (
                            <div className="text-sm text-muted-foreground">
                              {Object.values(task.content).map((v, i) => (
                                <p key={i}>• {String(v)}</p>
                              ))}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Bottom: Feedback & Actions */}
      <Card className="md:col-span-3">
        <CardContent className="pt-6 space-y-4">
          {/* <Textarea
            placeholder="Want to change anything? Describe it here…"
            onBlur={(e) => onRequestChanges(e.target.value)}
          /> */}
          <div className="flex justify-end gap-3">
            {/* <Button variant="outline">Request Changes</Button> */}
            <Button onClick={onApprove}>Approve Plan</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
