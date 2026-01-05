import { askQuestionClient } from "../tools/implementations/askQuestion";

export const implementations = {
  ask_questions: askQuestionClient,
};

export const functionCallClient = async (
  name: string,
  data: any
): Promise<Questions> => {
  console.log(name, data);
  const fn = implementations[name];
  if (!fn) throw new Error(`Function ${name} not found`);
  return await fn(data);
};
