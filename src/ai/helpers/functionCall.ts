import { FunctionCall } from "@google/genai";
import { askQuestions } from "../tools/implementations/askQuestion";
import { updatePlan } from "../tools/implementations/updatePlan";

export const implementations = {
  ask_questions: askQuestions,
  update_plan: updatePlan,
};

export const getFunctionArgs = (
  args: Record<string, unknown>,
  fnName: string,
  token: string,
  userId: string,
  convId: string,
) => {
  let functionArgs: any;
  if (fnName === "ask_questions") {
    const { collected_info, questions } = args;
    functionArgs = {
      questions: questions,
      collectedInfo: collected_info,
      token: token,
      userId: userId,
      convId: convId,
    };
  } else if (fnName === "update_plan") {
    const { tasks, newInfo } = args;
    functionArgs = {
      tasks: tasks,
      newInfo: newInfo,
      token: token,
      userId: userId,
      convId: convId,
    };
  }
  return functionArgs;
};

export const functionCall = async (
  functionCall: FunctionCall,
  token: string,
  userId: string,
  convId: string,
) => {
  const { name, args } = functionCall;
  const fn = implementations[name];
  if (!fn) throw new Error(`Function ${name} not found`);
  const functionArgs = getFunctionArgs(args, name, token, userId, convId);
  const data = await fn(functionArgs);

  return data;
};
