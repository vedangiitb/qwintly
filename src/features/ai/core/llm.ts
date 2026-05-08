import { ChatGoogleGenerativeAI as ChatGoogle } from "@langchain/google-genai";
import {
  AI_MODELS,
  MODEL_PROVIDERS,
  type AiModelKey,
  type AiModelName,
} from "./modelInfo";

export type aiModels = AiModelKey;

const PROVIDER_FACTORIES = {
  [MODEL_PROVIDERS.GEMINI]: (model: AiModelName) =>
    new ChatGoogle({
      apiKey: process.env.GEMINI_API_KEY,
      model,
    }),
} as const;

export const llm = () => {
  return PROVIDER_FACTORIES[MODEL_PROVIDERS.GEMINI](
    AI_MODELS.GEMINI.GEMINI_2_5_FLASH_LITE,
  );
};
