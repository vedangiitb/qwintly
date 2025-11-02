"use client";
import { Message } from "@/types/chat";
import { useCallback, useRef, useState } from "react";
import {
  addToDB,
  fetchChatMessages,
  streamChatResponse,
} from "../../services/chat/chatService";
import { usePrompt } from "./PromptContext";

export const useChat = () => {
  const { prompt, setPrompt } = usePrompt();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const hasSubmittedRef = useRef(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const [isResponseLoading, setResponseLoading] = useState(false);

  // fetch existing chat messages and set currentChatId
  const fetchChat = useCallback(async (chatId: string) => {
    if (!chatId) return;
    setCurrentChatId(chatId);

    const { messages: fetched, error } = await fetchChatMessages(chatId);
    if (!error && fetched && fetched.length > 0) {
      setMessages(fetched);
    } else if (error) {
      console.error("fetchChat error", error);
    } else {
      setMessages([]);
    }
  }, []);

  const startStream = useCallback(
    async (chatId: string, prompt: string) => {
      if (!chatId || !prompt) throw new Error("chatId or prompt missing");

      // Cancel any existing stream
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }

      const controller = new AbortController();
      abortControllerRef.current = controller;

      setMessages((prev) => {
        const newUserMsg: Message = { role: "user", content: prompt };
        return [...prev, newUserMsg];
      });

      // Best-effort persist user message — do not block streaming
      addToDB({ role: "user", content: prompt }, chatId).catch((e) =>
        console.warn("Failed to persist user message", e)
      );
      setIsStreaming(true);
      hasSubmittedRef.current = true;

      let responseText = "";

      try {
        // Use the latest snapshot of messages by reading state inside stream handler
        // We'll pass a shallow copy of messages for the server to have context — it's okay if slightly stale
        const snapshotForServer = await (async () => {
          return messages;
        })();

        await streamChatResponse(
          snapshotForServer.concat([{ role: "user", content: prompt }]),
          chatId,
          (chunk) => {
            if (!responseText.trim()) setResponseLoading(false);
            responseText += chunk + " ";
            setMessages((prev) => {
              const last = prev[prev.length - 1];
              if (last?.role === "assistant") {
                return [
                  ...prev.slice(0, -1),
                  { role: "assistant", content: responseText },
                ];
              }
              return [...prev, { role: "assistant", content: responseText }];
            });
          },
          { signal: controller.signal }
        );

        addToDB({ role: "assistant", content: responseText }, chatId).catch(
          (e) => console.warn("Failed to persist assistant message", e)
        );
      } catch (e: any) {
        if (e?.name === "AbortError") {
          // user cancelled — don't treat as error
          console.info("Streaming aborted");
        } else {
          console.error("Streaming failed", e);
          setMessages((prev) => [
            ...prev,
            { role: "assistant", content: `Error: ${e?.message || String(e)}` },
          ]);
        }
      } finally {
        setIsStreaming(false);
        abortControllerRef.current = null;
      }
    },
    [prompt, messages]
  );
  const cancelStream = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setIsStreaming(false);
    }
  }, []);

  const submitResponse = useCallback(
    (id?: string) => {
      setResponseLoading(true);
      const chatId = id ?? currentChatId;
      if (!chatId) throw new Error("No chatId provided for submitResponse");
      startStream(chatId, prompt).catch((e) => console.error(e));
      setPrompt("");
    },
    [currentChatId, startStream]
  );

  return {
    prompt,
    setPrompt,
    submitResponse,
    messages,
    isStreaming,
    hasSubmittedRef,
    fetchChat,
    currentChatId,
    setCurrentChatId,
    cancelStream,
    isResponseLoading,
  } as const;
};
