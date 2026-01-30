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

  console.log(geminiPrompt)

  const result = await aiResponse(geminiPrompt, {
    tools: tool,
    toolCallNeeded: false,
  });

  console.log(result,result.candidates[0].content)

  const response = {
    text: "",
    functionCallData: null,
  };

  // 1️⃣ Handle function call FIRST
  if (result.functionCalls && result.functionCalls.length > 0) {
    const fc = result.functionCalls[0];

    const data = await functionCall(fc, token, userId, chatId);

    response.functionCallData = {
      data,
      name: fc.name, 
    };

    // IMPORTANT: return here or skip text validation
    return response;
  }

  // 2️⃣ Handle text response
  if (result.text && result.text.trim().length > 0) {
    response.text = result.text;
    return response;
  }

  // 3️⃣ Truly empty response (rare)
  throw new Error("AI returned no usable content");
});
