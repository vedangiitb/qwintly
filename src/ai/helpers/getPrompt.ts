import { Message, Stage } from "@/types/chat";
import { Content } from "@google/genai";
import { EXECUTER_PROMPT } from "../prompts/executer.prompt";
import { PLANNER_PROMPT } from "../prompts/planner.prompt";
import { QUESTIONER_PROMPT } from "../prompts/questioner.prompt";
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
  questionAnswers: QuestionAnswers[],
): Content[] => {
  const systemPrompts = {
    init: STARTER_PROMPT(),
    questioner: QUESTIONER_PROMPT(questionAnswers, collectedInfo),
    planner: PLANNER_PROMPT(questionAnswers, collectedInfo),
    executer: EXECUTER_PROMPT(),
  };

  const geminiPrompt: Content[] = [];

  // ✅ System prompt
  geminiPrompt.push({
    role: "user",
    parts: [{ text: systemPrompts[stage] }],
  });

  if (stage === stages.INIT) {
    const messages = convHistory.filter(
      (msg) => msg.stage === stages.INIT && msg.msgType === "message",
    );

    geminiPrompt.push(
      ...messages.map((msg) => ({
        role: msg.role,
        parts: [{ text: String(msg.content) }],
      })),
    );
  }

  if (stage === stages.QUESTIONER || stage === stages.PLANNER) {
    const messages = convHistory.filter(
      (msg) =>
        msg.stage === stage && msg.role === "user" && msg.msgType === "message",
    );

    geminiPrompt.push(
      ...messages.map((msg) => ({
        role: "user",
        parts: [{ text: String(msg.content) }],
      })),
    );
  }

  // EXECUTER intentionally omitted for now

  return geminiPrompt;
};
