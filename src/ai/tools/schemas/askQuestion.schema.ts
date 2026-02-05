import { Type } from "@google/genai";

export const askQuestions = {
  name: "ask_questions",
  description:
    "Collects known project information and asks required questions to define the project clearly",
  parameters: {
    type: Type.OBJECT,
    properties: {
      collected_info: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          description: { type: Type.STRING },
          category: { type: Type.STRING },
          target_users: { type: Type.STRING },
          otherInfo: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
        },
        required: ["name", "description", "category", "target_users"],
      },
      questions: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            question: { type: Type.STRING },
            type: {
              type: Type.STRING,
              enum: ["text", "single_select", "multi_select"],
            },
            options: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            answer_default: { type: Type.STRING },
          },
          required: ["id", "question", "type"],
        },
      },
    },
    required: ["collected_info", "questions"],
  },
};
