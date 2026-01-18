"use client";

import { createContext, useContext, useState } from "react";
import { Message, recentChatInterface } from "@/types/chat";

/* ---------- TYPES ---------- */

export type ChatSessionState = {
  messages: Message[];
  chatId: string | null;
  recentChatList: recentChatInterface[];
  prompt: string;

  questions: Questions;
  answers: string[];
  collectedInfo: CollectedInfo;

  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  setChatId: (id: string | null) => void;
  setRecentChatList: React.Dispatch<
    React.SetStateAction<recentChatInterface[]>
  >;
  setPrompt: (prompt: string) => void;

  setQuestions: React.Dispatch<React.SetStateAction<Questions>>;
  setAnswers: React.Dispatch<React.SetStateAction<string[]>>;
  setCollectedInfo: React.Dispatch<React.SetStateAction<CollectedInfo>>;

  addMessage: (msg: Message) => void;
  clearPrompt: () => void;
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
  const [messages, setMessages] = useState<Message[]>([]);
  const [chatId, setChatId] = useState<string | null>(null);

  const [recentChatList, setRecentChatList] = useState<recentChatInterface[]>(
    [],
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

  const [prompt, setPrompt] = useState("");

  /* ---------- HELPERS ---------- */

  const addMessage = (msg: Message) => {
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

  const clearPrompt = () => {
    setPrompt("");
  };

  return (
    <ChatSessionContext.Provider
      value={{
        messages,
        chatId,
        recentChatList,
        prompt,
        questions,
        answers,
        collectedInfo,

        setMessages,
        setChatId,
        setPrompt,
        setRecentChatList,
        setQuestions,
        setAnswers,
        setCollectedInfo,

        addMessage,
        clearPrompt,
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
