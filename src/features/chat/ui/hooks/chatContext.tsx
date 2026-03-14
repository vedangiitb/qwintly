"use client";

import { Plan } from "@/features/ai/types/updatePlan.types";
import { QuestionAnswers } from "@/features/ai/types/askQuestions.types";
import { Chat } from "@/features/chat/types/chat.types";
import { Message } from "@/features/chat/types/messages.types";
import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

export interface ChatContextValue {
  chatId: string | null;
  prompt: string;
  messages: Message[];
  questionAnswersByMessageId: Record<string, QuestionAnswers>;
  plansByMessageId: Record<string, Plan>;
  latestQuestionSetId: string | null;
  latestPlanMessageId: string | null;
  isGeneratingResponse: boolean;
  isGenerating: boolean;
  generationStatus: string | null;
  url: string | null;
  recentChats: Chat[];
  messagesCursor: string | null;
  hasMoreMessages: boolean;
  error: string | null;
  setChatId: React.Dispatch<React.SetStateAction<string | null>>;
  setPrompt: React.Dispatch<React.SetStateAction<string>>;
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  setQuestionAnswersByMessageId: React.Dispatch<
    React.SetStateAction<Record<string, QuestionAnswers>>
  >;
  setPlansByMessageId: React.Dispatch<React.SetStateAction<Record<string, Plan>>>;
  setLatestQuestionSetId: React.Dispatch<React.SetStateAction<string | null>>;
  setLatestPlanMessageId: React.Dispatch<React.SetStateAction<string | null>>;
  setIsGeneratingResponse: React.Dispatch<React.SetStateAction<boolean>>;
  setIsGenerating: React.Dispatch<React.SetStateAction<boolean>>;
  setGenerationStatus: React.Dispatch<React.SetStateAction<string | null>>;
  setUrl: React.Dispatch<React.SetStateAction<string | null>>;
  setRecentChats: React.Dispatch<React.SetStateAction<Chat[]>>;
  setMessagesCursor: React.Dispatch<React.SetStateAction<string | null>>;
  setHasMoreMessages: React.Dispatch<React.SetStateAction<boolean>>;
  setError: React.Dispatch<React.SetStateAction<string | null>>;
  clearError: () => void;
  resetActiveChatState: () => void;
}

const ChatContext = createContext<ChatContextValue | null>(null);

export const ChatProvider = ({ children }: { children: React.ReactNode }) => {
  const [chatId, setChatId] = useState<string | null>(null);
  const [prompt, setPrompt] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [questionAnswersByMessageId, setQuestionAnswersByMessageId] = useState<
    Record<string, QuestionAnswers>
  >({});
  const [plansByMessageId, setPlansByMessageId] = useState<Record<string, Plan>>(
    {},
  );
  const [latestQuestionSetId, setLatestQuestionSetId] = useState<string | null>(
    null,
  );
  const [latestPlanMessageId, setLatestPlanMessageId] = useState<string | null>(
    null,
  );
  const [isGeneratingResponse, setIsGeneratingResponse] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStatus, setGenerationStatus] = useState<string | null>(null);
  const [url, setUrl] = useState<string | null>(null);
  const [recentChats, setRecentChats] = useState<Chat[]>([]);
  const [messagesCursor, setMessagesCursor] = useState<string | null>(null);
  const [hasMoreMessages, setHasMoreMessages] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => setError(null), []);

  const resetActiveChatState = useCallback(() => {
    setChatId(null);
    setMessages([]);
    setQuestionAnswersByMessageId({});
    setPlansByMessageId({});
    setLatestQuestionSetId(null);
    setLatestPlanMessageId(null);
    setMessagesCursor(null);
    setHasMoreMessages(false);
    setError(null);
  }, []);

  const value = useMemo<ChatContextValue>(
    () => ({
      chatId,
      prompt,
      messages,
      questionAnswersByMessageId,
      plansByMessageId,
      latestQuestionSetId,
      latestPlanMessageId,
      isGeneratingResponse,
      isGenerating,
      generationStatus,
      url,
      recentChats,
      messagesCursor,
      hasMoreMessages,
      error,
      setChatId,
      setPrompt,
      setMessages,
      setQuestionAnswersByMessageId,
      setPlansByMessageId,
      setLatestQuestionSetId,
      setLatestPlanMessageId,
      setIsGeneratingResponse,
      setIsGenerating,
      setGenerationStatus,
      setUrl,
      setRecentChats,
      setMessagesCursor,
      setHasMoreMessages,
      setError,
      clearError,
      resetActiveChatState,
    }),
    [
      chatId,
      prompt,
      messages,
      questionAnswersByMessageId,
      plansByMessageId,
      latestQuestionSetId,
      latestPlanMessageId,
      isGeneratingResponse,
      isGenerating,
      generationStatus,
      url,
      recentChats,
      messagesCursor,
      hasMoreMessages,
      error,
      clearError,
      resetActiveChatState,
    ],
  );

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

export const useChatContext = (): ChatContextValue => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChatContext must be used within ChatProvider");
  }
  return context;
};
