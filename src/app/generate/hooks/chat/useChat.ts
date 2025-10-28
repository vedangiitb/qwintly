"use client";
import { useState, useRef } from "react";
import { streamChatResponse } from "../../services/chat/chatService";
import { usePrompt } from "./PromptContext";

export const useChat = () => {
  const { prompt, setPrompt } = usePrompt();
  const [messages, setMessages] = useState<Chat[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const hasSubmittedRef = useRef(false);

  async function startStream(chatId: string) {
    const newMessages = [...messages, { role: "user", content: prompt }];
    setMessages(newMessages);
    setIsStreaming(true);

    let responseText = "";

    await streamChatResponse(newMessages, chatId, (chunk) => {
      responseText += chunk;
      setMessages((msgs: Chat[]) => {
        const last = msgs[msgs.length - 1];
        if (last?.role === "assistant") {
          return [
            ...msgs.slice(0, -1),
            { role: "assistant", content: responseText },
          ];
        } else {
          return [...msgs, { role: "assistant", content: responseText }];
        }
      });
    });

    setIsStreaming(false);
  }

  const submitResponse = (id: string) => {
    startStream(id);
    setPrompt("");
  };

  return { submitResponse, messages, isStreaming, hasSubmittedRef };
};
