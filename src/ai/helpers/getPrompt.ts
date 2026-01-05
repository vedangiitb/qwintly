import { Message } from "@/types/chat";
import { Content } from "@google/genai";
import { STARTER_PROMPT } from "../prompts/starter.prompt";

export const stages = { INIT: "init", QUESTIONER: "ques" };

export const getGeminiPrompt = (
  stage: string,
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
  }

  return geminiPrompt;
};
