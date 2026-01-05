import { functionCall, getFunctionText } from "@/ai/helpers/functionCall";
import { getGeminiPrompt } from "@/ai/helpers/getPrompt";
import { getTools } from "@/ai/helpers/getTools";
import { postHandler } from "@/lib/apiHandler";
import { verifyToken } from "@/lib/verifyToken";
import { Content } from "@google/genai";
import { aiResponse } from "../../../../../infra/gemini/gemini.client";

export const POST = postHandler(async ({ body, token }) => {
  const { chatId, messages, stage, collectedInfo, questions } = body;

  if (!stage || !messages)
    throw new Error(`Missing ${!stage ? "stage" : "messages"}`);

  const userId = await verifyToken(token);

  if (!messages || !Array.isArray(messages))
    throw new Error("Invalid messages");

  const tool = getTools(stage);

  const geminiPrompt: Content[] = getGeminiPrompt(
    stage,
    messages,
    collectedInfo,
    questions
  );

  const result = await aiResponse(geminiPrompt, {
    tools: tool,
    toolCallNeeded: false,
  });

  const parts = result.candidates?.[0]?.content?.parts[0];

  const response = {
    text: "",
    functionCallData: null,
  };

  if (parts.text) {
    response.text = parts.text;
  }

  if (parts.functionCall) {
    const data = await functionCall(parts.functionCall, token, userId, chatId);
    response.functionCallData = { data: data, name: parts.functionCall.name };
    if (!response.text) {
      response.text = getFunctionText(parts.functionCall.name);
    }
  }

  return response;
});
