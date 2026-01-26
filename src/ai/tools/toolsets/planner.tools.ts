import { Tool } from "@google/genai";
import { updatePlanSchema } from "../schemas/updatePlan.schema";

export const plannerTools: Tool[] = [
  {
    functionDeclarations: [updatePlanSchema],
  },
];
