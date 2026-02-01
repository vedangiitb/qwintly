import { Type } from "@google/genai";

export const updatePlanSchema = {
  name: "update_plan",
  description: "Create or update the product plan",
  parameters: {
    type: Type.OBJECT,
    required: ["tasks", "newInfo"],
    properties: {
      tasks: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          required: ["task_type", "intent", "description", "content"],
          properties: {
            task_type: { type: Type.STRING },
            intent: { type: Type.STRING },
            description: { type: Type.STRING },
            content: {
              type: Type.OBJECT,
              additionalProperties: true,
            },
            page: { type: Type.STRING },
            feature: { type: Type.STRING },
            service: { type: Type.STRING },
            component_id: { type: Type.STRING },
            new_feature_name: { type: Type.STRING },
          },
          additionalProperties: true,
        },
      },
      newInfo: {
        type: Type.OBJECT,
        required: ["name", "description"],
        properties: {
          name: { type: Type.STRING },
          description: { type: Type.STRING },
          category: { type: Type.STRING },
          target_users: { type: Type.STRING },
        },
        additionalProperties: true,
      },
    },
  },
};
