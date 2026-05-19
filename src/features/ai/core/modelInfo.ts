export const AI_MODELS = {
  GEMINI: {
    DEFAULT: "gemini-2.5-flash-lite",
    GEMINI_2_5_FLASH: "gemini-2.5-flash",
    GEMINI_2_5_FLASH_LITE: "gemini-2.5-flash-lite",
    GEMINI_3_1_FLASH_LITE:"gemini-3.1-flash-lite"
  },
  OPENAI: {
    DEFAULT: "gpt-4.1-nano",
    OPENAI_GPT_4_1_NANO: "gpt-4.1-nano",
    OPENAI_GPT_4O_MINI: "gpt-4o-mini",
    OPENAI_GPT_5_MINI: "gpt-5-mini",
    OPENAI_GPT_5_NANO: "gpt-5-nano",
  },
} as const;

export const MODEL_PROVIDERS = {
  DEFAULT: "gemini",
  GEMINI: "gemini",
  OPENAI: "openai",
} as const;

export type AiModelKey = keyof typeof AI_MODELS;
export type AiModelName =
  (typeof AI_MODELS)[AiModelKey][keyof (typeof AI_MODELS)[AiModelKey]];

export const DEFAULT_PROVIDER = MODEL_PROVIDERS.GEMINI;
export const DEFAULT_MODEL = AI_MODELS.GEMINI.DEFAULT;
