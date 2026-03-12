import { tool } from "@langchain/core/tools";
import {
  CollectedContextSchema,
  UpdateContextSchema,
} from "../schemas/updateContext.schema";

export const updateContextTool = tool(
  async ({ collectedContext }) => {
    const parsed = CollectedContextSchema.parse(collectedContext);

    return { collectedContext: parsed };
  },
  {
    name: "update_context",
    description: "Update and persist the normalized collected project context.",
    schema: UpdateContextSchema,
  },
);
