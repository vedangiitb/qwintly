import { Stage } from "@/types/chat";
import { plannerTools } from "../tools/toolsets/planner.tools";
import { starterTools } from "../tools/toolsets/starter.tools";

export const getTools = (stage: Stage) => {
  const tools = {
    init: starterTools,
    questioner: plannerTools,
    planner: plannerTools,
  };

  return tools[stage];
};
