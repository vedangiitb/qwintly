import { Stage } from "@/types/chat";
import { askQuestionClient } from "../tools/implementations/askQuestion";
import { updatePlanClient } from "../tools/implementations/updatePlan";

export const implementations = {
  ask_questions: askQuestionClient,
  update_plan: updatePlanClient,
};

export const functionCallClient = async (
  name: string,
  data: any,
  updateProjectStage: (stage: Stage) => void,
): Promise<any> => {
  const fn = implementations[name];
  if (!fn) throw new Error(`Function ${name} not found`);
  return await fn(data, updateProjectStage);
};
