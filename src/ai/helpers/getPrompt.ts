import { Message, Stage } from "@/types/chat";
import { Content } from "@google/genai";
import { STARTER_PROMPT } from "../prompts/starter.prompt";

export const stages = {
  INIT: "init",
  QUESTIONER: "questioner",
  PLANNER: "planner",
  EXECUTER: "executer",
};

export const getGeminiPrompt = (
  stage: Stage,
  convHistory: Message[],
  collectedInfo: CollectedInfo,
  questions: Questions
): Content[] => {
  const systemPrompts = {
    init: STARTER_PROMPT(),
  };

  const geminiPrompt: Content[] = [];

  // System prompt (stage specific)
  geminiPrompt.push({ role: "user", parts: [{ text: systemPrompts[stage] }] });

  if (stage == stages.INIT) {
    // INIT stage => Push all messages
    geminiPrompt.push(
      ...convHistory.map((msg) => ({
        role: msg.role,
        parts: [{ text: msg.content as string }],
        msgType: "message",
      }))
    );
  } else if (stage == stages.QUESTIONER) {
    // QUESTIONER stage => Push only collected info, questioner messages & Questions list
    geminiPrompt.push({
      role: "assistant",
      parts: [{ text: `Collected Info: ${JSON.stringify(collectedInfo)}` }],
    });

    geminiPrompt.push({
      role: "assistant",
      parts: [{ text: `Questions: ${JSON.stringify(questions)}` }],
    });

    geminiPrompt.push(
      ...convHistory.map(
        (msg) =>
          msg.stage == stages.QUESTIONER &&
          msg.msgType == "message" && {
            role: msg.role,
            parts: [{ text: msg.content as string }],
          }
      )
    );
  } else if (stage == stages.PLANNER) {
    // PLANNER stage => Push only collected info, questioner messages & Questions & Answers list
  } else if (stage == stages.EXECUTER) {
    // EXECUTER stage => Push only collected info, Complete plan Current Plan
  } else {
    throw new Error("Invalid stage");
  }

  return geminiPrompt;
};
