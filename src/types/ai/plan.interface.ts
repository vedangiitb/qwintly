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