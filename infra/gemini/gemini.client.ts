import {
  Content,
  FunctionCallingConfigMode,
  GenerateContentConfig,
  Tool,
} from "@google/genai";
import { ai, MODEL } from "./gemini.config";

type AIResponseOptions = {
  tools?: Tool[];
  model?: string;
  toolCallNeeded?: boolean;
};

export async function aiResponse(
  request: Content[],
  options: AIResponseOptions = {},
) {
  const { tools, toolCallNeeded } = options;

  const config: GenerateContentConfig = {};

  // Tool calling has highest priority
  if (tools && tools.length > 0) {
    config.tools = tools;
    if (toolCallNeeded) {
      config.toolConfig = {
        functionCallingConfig: {
          mode: FunctionCallingConfigMode.AUTO,
        },
      };
    } else {
      config.toolConfig = {
        functionCallingConfig: {
          mode: FunctionCallingConfigMode.ANY,
        },
      };
    }
  }

  try {
    return await ai.models.generateContent({
      model: MODEL,
      contents: request,
      ...(Object.keys(config).length > 0 && { config }),
    });
  } catch (err: any) {
    throw new Error(`AI generation failed: ${err?.message || "Unknown error"}`);
  }
}
