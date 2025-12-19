export const updateSchema = {
  name: "update_schema",
  description: "Update website schema for collector agent",
  parameters: {
    type: "object",
    properties: {
      status: { type: "string", enum: ["COLLECTING", "COMPLETE"] },
      schema: {
        type: "object",
        properties: {
          brandName: { type: "string" },
          businessType: { type: "string" },
          tagline: { type: "string" },
          primaryColor: { type: "string" },
          secondaryColor: { type: "string" },
          targetAudience: { type: "string" },
          pages: { type: "array", items: { type: "string" } },
          tone: { type: "string" },
        },
        required: [
          "brandName",
          "businessType",
          "tagline",
          "primaryColor",
          "secondaryColor",
          "targetAudience",
          "pages",
          "tone",
        ],
      },
    },
    required: ["status", "schema"],
  },
};
