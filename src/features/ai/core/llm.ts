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
  [MODEL_PROVIDERS.OPENAI]: (_model: AiModelName) => {
    throw new Error(
      "OpenAI models are configured but no OpenAI chat provider is wired yet.",
    );
  },
} as const;

const resolveModelName = (model: aiModels): AiModelName => {
  return AI_MODELS[model];
};

const resolveProvider = (modelName: AiModelName) => {
  if (modelName.startsWith(MODEL_PROVIDERS.GEMINI)) {
    return MODEL_PROVIDERS.GEMINI;
  }
  if (modelName.startsWith(MODEL_PROVIDERS.OPENAI)) {
    return MODEL_PROVIDERS.OPENAI;
  }

  throw new Error(`Model not supported: ${modelName}`);
};

export const llm = (model: aiModels = "DEFAULT") => {
  if (model === "DEFAULT") {
    return PROVIDER_FACTORIES[MODEL_PROVIDERS.GEMINI](
      AI_MODELS.GEMINI_2_5_FLASH_LITE,
    );
  }
  const modelName = resolveModelName(model);
  const provider = resolveProvider(modelName);

  return PROVIDER_FACTORIES[provider](modelName);
};
