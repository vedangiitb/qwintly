export interface aiPlatform {
  enabled: boolean;
  name: string;
}

export const aiPlatforms = {
  openai: {
    name: "OpenAi",
  },
  gemini: {
    name: "Gemini",
  },
  claude: {
    name: "Claude",
  },
};
