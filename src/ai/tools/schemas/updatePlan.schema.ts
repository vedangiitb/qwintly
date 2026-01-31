import { Type } from "@google/genai";

export const updatePlanSchema = {
  name: "update_plan",
  description:
    "Create/Update Plan for the product changes and send them to the backend",
  parameters: {
    type: Type.OBJECT,
    properties: {
      tasks: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            task_id: { type: Type.STRING },
            task_type: {
              type: Type.STRING,
              enum: ["ui_task", "be_task", "db_task"],
            },
            intent: {
              type: Type.STRING,
              enum: [
                "add_page",
                "add_section",
                "modify_section",
                "modify_text_content",
                "modify_styling",
                "add_new_service",
                "modify_service",
                "connect_ai",
                "db_connection",
                "add_new_table",
                "modify_schema",
                "modify_table",
                "add_new_column",
                "modify_column",
              ],
            },
            description: { type: Type.STRING },
            content: { type: Type.OBJECT },
            page: { type: Type.STRING },
            new_feature_name: { type: Type.STRING },
            feature: { type: Type.STRING },
            service: { type: Type.STRING },
            component_id: { type: Type.STRING },
          },
          required: [
            "task_id",
            "task_type",
            "intent",
            "description",
            "content",
            "page",
            "new_feature_name",
            "feature",
            "service",
            "component_id",
          ],
        },
      },
      newInfo: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          description: { type: Type.STRING },
          category: { type: Type.STRING },
          targetUsers: { type: Type.STRING },
          otherInfo: { type: Type.STRING },
        },
        required: ["name", "description", "category", "targetUsers"],
      },
    },
    required: ["tasks", "newInfo"],
  },
};
