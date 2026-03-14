"use client";

import { useCallback } from "react";
import { useChat } from "./useChat";

export const useInitChat = () => {
  const { prompt, setPrompt, isGeneratingResponse, error, sendMessage } = useChat();

  const startChat = useCallback(async () => {
    if (!prompt.trim()) return;
    await sendMessage(prompt);
  }, [prompt, sendMessage]);

  return {
    prompt,
    setPrompt,
    isGeneratingResponse,
    error,
    startChat,
  } as const;
};
