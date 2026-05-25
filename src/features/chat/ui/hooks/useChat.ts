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
    recentChatsCursor,
    hasMoreRecentChats,
    isLoadingRecentChats,
    hasMoreMessages,
    isLoadingOlderMessages,
    error,
    setPrompt,
    clearError,
    resetActiveChatState: resetChatContextState,
  } = context;
  const { clearStatusState, setGenerating, setActiveChatId, setSiteUrl, setPreviewUrl } =
    useGenerate();
  const actions = useChatActions({ context, abortControllerRef });

  const resetActiveChatState = useCallback(() => {
    resetChatContextState();
    clearStatusState();
    setGenerating(false);
    setActiveChatId(null);
    setSiteUrl(null);
    setPreviewUrl(null);
  }, [
    resetChatContextState,
    clearStatusState,
    setGenerating,
    setActiveChatId,
    setSiteUrl,
    setPreviewUrl,
  ]);

  return {
    chatId,
    prompt,
    messages,
    recentChats,
    recentChatsCursor,
    hasMoreRecentChats,
    isLoadingRecentChats,
    questionAnswersByMessageId,
    plansByMessageId,
    latestQuestionSetId,
    latestPlanMessageId,
    isGeneratingResponse,
    error,
    hasMoreMessages,
    isLoadingOlderMessages,
    setPrompt,
    ...actions,
    clearError,
    resetActiveChatState,
  } as const;
};
