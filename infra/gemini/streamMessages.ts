import { Content, Tool } from "@google/genai";
import { ai, MODEL } from "./gemini.config";

export const streamGeminiMessages = async (
  contents: Content[],
  tools: Tool[]
) => {
  const stream = await ai.models.generateContentStream({
    model: MODEL,
    contents: contents,
    config: {
      tools: tools,
    },
  });

  return stream;
};
