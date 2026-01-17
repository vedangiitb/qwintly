"use client";

import { createContext, useContext, useState } from "react";
import { recentChatInterface } from "@/types/chat";

/* ---------- TYPES ---------- */

export type ChatSessionState = {
  messages: string[];
  chatId: string | null;
  recentChatList: recentChatInterface[];

  questions: Questions;
  answers: string[];
  collectedInfo: CollectedInfo;

  setMessages: React.Dispatch<React.SetStateAction<string[]>>;
  setChatId: (id: string | null) => void;
  setRecentChatList: React.Dispatch<
    React.SetStateAction<recentChatInterface[]>
  >;

  setQuestions: React.Dispatch<React.SetStateAction<Questions>>;
  setAnswers: React.Dispatch<React.SetStateAction<string[]>>;
  setCollectedInfo: React.Dispatch<React.SetStateAction<CollectedInfo>>;

  addMessage: (msg: string) => void;
  clearSession: () => void;
};

/* ---------- CONTEXT ---------- */

const ChatSessionContext = createContext<ChatSessionState | null>(null);

/* ---------- PROVIDER ---------- */

export const ChatSessionProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [messages, setMessages] = useState<string[]>([]);
  const [chatId, setChatId] = useState<string | null>(null);

  const [recentChatList, setRecentChatList] = useState<recentChatInterface[]>(
    []
  );

  const [questions, setQuestions] = useState<Questions>([]);
  const [answers, setAnswers] = useState<string[]>([]);

  const [collectedInfo, setCollectedInfo] = useState<CollectedInfo>({
    name: "",
    description: "",
    category: "",
    targetUsers: "",
    otherInfo: [],
  });

  /* ---------- HELPERS ---------- */

  const addMessage = (msg: string) => {
    setMessages((prev) => [...prev, msg]);
  };

  const clearSession = () => {
    setMessages([]);
    setChatId(null);
    setQuestions([]);
    setAnswers([]);
    setCollectedInfo({
      name: "",
      description: "",
      category: "",
      targetUsers: "",
      otherInfo: [],
    });
  };

  return (
    <ChatSessionContext.Provider
      value={{
        messages,
        chatId,
        recentChatList,
        questions,
        answers,
        collectedInfo,

        setMessages,
        setChatId,
        setRecentChatList,
        setQuestions,
        setAnswers,
        setCollectedInfo,

        addMessage,
        clearSession,
      }}
    >
      {children}
    </ChatSessionContext.Provider>
  );
};

/* ---------- HOOK ---------- */

export const useChatSession = () => {
  const ctx = useContext(ChatSessionContext);
  if (!ctx) {
    throw new Error("useChatSession must be used inside ChatSessionProvider");
  }
  return ctx;
};
