import { starterTools } from "../tools/toolsets/starter.tools";

export const getTools = (stage: string) => {
  const tools = {
    init: starterTools,
  };

  return tools[stage];
};
