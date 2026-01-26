import { functionCall } from "@/ai/helpers/functionCall";
import { getGeminiPrompt } from "@/ai/helpers/getPrompt";
import { getTools } from "@/ai/helpers/getTools";
import { postHandler } from "@/lib/apiHandler";
import { verifyToken } from "@/lib/verifyToken";
import { Content } from "@google/genai";
import { aiResponse } from "../../../../../infra/gemini/gemini.client";

export const POST = postHandler(async ({ body, token }) => {
  const { chatId, messages, stage, collectedInfo, questionAnswers } = body;

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
    questionAnswers,
  );

  const result = await aiResponse(geminiPrompt, {
    tools: tool,
    toolCallNeeded: false,
  });
  const response = {
    text: "",
    functionCallData: null,
  };

  const parts = result.candidates?.[0]?.content?.parts ?? [];

  const functionCallPart = parts.find((p) => p.functionCall);
  const textPart = parts.find((p) => p.text);

  if (functionCallPart?.functionCall) {
    const data = await functionCall(
      functionCallPart.functionCall,
      token,
      userId,
      chatId,
    );

    response.functionCallData = {
      data,
      name: functionCallPart.functionCall.name,
    };
  } else if (textPart?.text) {
    response.text = textPart.text;
  } else {
    throw new Error("AI returned no usable content");
  }

  return response;
});
