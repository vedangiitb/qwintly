"use client";

import { useGenerate } from "@/features/generate/ui/hooks/useGenerate";
import { useCallback, useRef } from "react";
import { useChatContext } from "./chatContext";
import { useChatActions } from "./useChat/useChat.actions";

export const useChat = () => {
  const abortControllerRef = useRef<AbortController | null>(null);

  const context = useChatContext();
  const {
    chatId,
    prompt,
    messages,
    questionAnswersByMessageId,
    plansByMessageId,
    latestQuestionSetId,
    latestPlanMessageId,
    isGeneratingResponse,
    recentChats,
    hasMoreMessages,
    error,
    setPrompt,
    clearError,
    resetActiveChatState: resetChatContextState,
  } = context;
  const { clearStatusState, setGenerating } = useGenerate();
  const actions = useChatActions({ context, abortControllerRef });

  const resetActiveChatState = useCallback(() => {
    resetChatContextState();
    clearStatusState();
    setGenerating(false);
  }, [resetChatContextState, clearStatusState, setGenerating]);

  return {
    chatId,
    prompt,
    messages,
    recentChats,
    questionAnswersByMessageId,
    plansByMessageId,
    latestQuestionSetId,
    latestPlanMessageId,
    isGeneratingResponse,
    error,
    hasMoreMessages,
    setPrompt,
    ...actions,
    clearError,
    resetActiveChatState,
  } as const;
};
