export const updateSchema = {
  name: "update_schema",
  description: "Update PM task schema generated from user conversation",
  parameters: {
    type: "object",
    properties: {
      status: {
        type: "string",
        enum: ["COLLECTING", "COMPLETE"],
      },
      schema: {
        type: "object",
        properties: {
          tasks: {
            type: "array",
            items: {
              type: "object",
              properties: {
                task_id: { type: "string" },
                task_type: {
                  type: "string",
                  enum: ["ui_task", "be_task", "db_task"],
                },
                intent: {
                  type: "string",
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
                description: { type: "string" },
                content: { type: "object" },
                page: { type: "string" },
                new_feature_name: { type: "string" },
                feature: { type: "string" },
                service: { type: "string" },
                component_id: { type: "string" },
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
        },
        required: ["tasks"],
      },
    },
    required: ["status", "schema"],
  },
};
