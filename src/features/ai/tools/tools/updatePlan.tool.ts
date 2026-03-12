import { tool } from "@langchain/core/tools";
import { UpdatePlanSchema } from "../schemas/updatePlan.schema";

export const updatePlanTool = tool(async ({ tasks, status }) => ({ tasks, status }), {
  name: "update_plan",
  description:
    "Create or update the structured implementation plan for the project.",
  schema: UpdatePlanSchema,
});
