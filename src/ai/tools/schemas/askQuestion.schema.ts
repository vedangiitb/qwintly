export const askQuestions = {
  name: "ask_questions",
  description:
    "Collects known project information and asks required questions to define the project clearly",
  parameters: {
    type: "object",
    properties: {
      collected_info: {
        type: "object",
        properties: {
          name: { type: "string" },
          description: { type: "string" },
          category: { type: "string" },
          targetUsers: { type: "string" },
          otherInfo: {
            type: "array",
            items: { type: "string" },
          },
        },
        required: ["name", "description", "category", "targetUsers"],
      },
      questions: {
        type: "array",
        items: {
          type: "object",
          properties: {
            id: { type: "string" },
            question: { type: "string" },
            type: {
              type: "string",
              enum: ["text", "single_select", "multi_select"],
            },
            options: {
              type: "array",
              items: { type: "string" },
            },
            answer_default: { type: "string" },
          },
          required: ["id", "question", "type"],
        },
      },
    },
    required: ["collected_info", "questions"],
  },
};
