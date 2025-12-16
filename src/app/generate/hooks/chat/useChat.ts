"use client";
import { setChatPrompt } from "@/lib/features/promptSlice";
import { AppDispatch, RootState } from "@/lib/store";
import { Message, recentChatInterface } from "@/types/chat";
import { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  addToDB,
  fetchChatMessages,
  streamChatResponse,
  userChats,
} from "../../services/chat/chatService";
import { setIsGenerating, setGenerateStatus } from "@/lib/features/genUiSlice";

export const useChat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const hasSubmittedRef = useRef(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const assistantPersistedRef = useRef(false);
  const [isResponseLoading, setResponseLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [recentChats, setRecentChats] = useState<recentChatInterface[]>([]);
  const dispatch = useDispatch<AppDispatch>();
  const generatingsite = useSelector(
    (state: RootState) => state.genUi.isGenerating
  );
  const generateStatus = useSelector(
    (state: RootState) => state.genUi.generateStatus
  );
  const prompt = useSelector((state: RootState) => state.prompt.prompt);
  const [changes, setChanges] = useState(false);

  const setPrompt: (p: string) => any = (p: string) => {
    dispatch(setChatPrompt(p));
  };

  const setSiteGenerating = (generating: boolean) => {
    dispatch(setIsGenerating(generating));
  };

  // fetch existing chat messages and set currentChatId
  const fetchChat = useCallback(async (chatId: string) => {
    if (!chatId) return;
    setCurrentChatId(chatId);

    const { messages: fetched, error } = await fetchChatMessages(chatId);
    if (!error && fetched && fetched.length > 0) {
      setMessages(fetched);
      return true;
    } else if (error) {
      console.error("fetchChat error", error);
      return false;
    } else {
      setMessages([]);
      return false;
    }
  }, []);

  const startStream = useCallback(
    async (chatId: string, prompt: string) => {
      console.log(chatId, prompt);
      if (!chatId || !prompt) {
        throw new Error("chatId or prompt missing");
      }

      // Abort any existing stream
      abortControllerRef.current?.abort();
      const controller = new AbortController();
      abortControllerRef.current = controller;

      // Push user message locally
      setMessages((prev) => [...prev, { role: "user", content: prompt }]);

      // Persist user message (non-blocking)
      addToDB({ role: "user", content: prompt }, chatId);

      setResponseLoading(true);
      hasSubmittedRef.current = true;
      assistantPersistedRef.current = false;

      let assistantText = ""; // streaming visible text
      let finalSchema: any = null;

      try {
        const snapshotForServer: Message[] = [
          ...messages,
          { role: "user", content: prompt } as Message,
        ];

        await streamChatResponse({
          messages: snapshotForServer,
          chatId,
          signal: controller.signal,

          onToken: (token) => {
            console.log("onToken", token);
            assistantText += token;

            setMessages((prev) => {
              const last = prev[prev.length - 1];
              if (last?.role === "assistant") {
                return [
                  ...prev.slice(0, -1),
                  { role: "assistant", content: assistantText },
                ];
              }
              return [...prev, { role: "assistant", content: assistantText }];
            });
          },

          onMetadata: (meta) => {
            finalSchema = meta.schema; // machine use
            console.log(finalSchema);
            // Persist mid-stream metadata message (if desired), but avoid duplicate insertions.
            if (!assistantPersistedRef.current && assistantText?.length) {
              console.log(
                "onMetadata: persisting assistant message (partial)",
                assistantText
              );
              assistantPersistedRef.current = true;
              addToDB({ role: "assistant", content: assistantText }, chatId)
                .then((ok) => console.log("addToDB(metadata) success", ok))
                .catch((e) => console.error("addToDB metadata failed", e));
            }
          },

          onComplete: (meta) => {
            finalSchema = meta.schema;
            console.log(finalSchema);

            // Final assistant message if needed
            setMessages((prev) => {
              const last = prev[prev.length - 1];
              // If assistant already streaming text, keep it
              if (last?.role === "assistant") return prev;

              return [...prev, { role: "assistant", content: assistantText }];
            });

            // Persist assistant final message (avoid duplicates)
            if (!assistantPersistedRef.current && assistantText?.length) {
              console.log(
                "onComplete: persisting assistant message (final)",
                assistantText
              );
              assistantPersistedRef.current = true;
              addToDB({ role: "assistant", content: assistantText }, chatId)
                .then((ok) => console.log("addToDB(onComplete) success", ok))
                .catch((e) => console.error("addToDB onComplete failed", e));
            }

            setSiteGenerating(true);

            // Start a websocket to receive generation status updates from the worker
            try {
              // close any existing ws
              if (wsRef.current) {
                try {
                  wsRef.current.close();
                } catch (e) {
                  console.error("ws close failed", e);
                }
                wsRef.current = null;
              }

              const sessionId = chatId;

              // Prefer a NEXT_PUBLIC env first for client usage
              const workerUrl =
                "wss://qwintly-wg-worker-296200543960.asia-south1.run.app";
              const wsUrl = `${workerUrl}/ws/${sessionId}`;
              const ws = new WebSocket(wsUrl);
              wsRef.current = ws;

              console.log("wsUrl", wsUrl);

              ws.addEventListener("open", () =>
                console.log("WS open for session", sessionId, wsUrl)
              );

              ws.addEventListener("message", (e) => {
                try {
                  console.log(e);

                  // Normalize data to string for UI/state updates
                  const dataStr =
                    typeof e.data === "string"
                      ? e.data
                      : JSON.stringify(e.data);

                  dispatch(setGenerateStatus(dataStr));

                  // Detect SUCCESS (support both plain string and JSON payloads)
                  let isSuccess = false;

                  if (typeof dataStr === "string" && dataStr === "SUCCESS") {
                    isSuccess = true;
                  }

                  if (isSuccess) {
                    // Update UI immediately so it doesn't wait for the close event
                    dispatch(setIsGenerating(false));

                    // Close the specific socket after 1s; let the 'close' handler perform cleanup
                    setTimeout(() => {
                      try {
                        ws.close();
                      } catch (err) {
                        console.error("ws close after SUCCESS failed", err);
                      }
                      // intentionally do NOT set wsRef.current = null here
                    }, 1000);
                  }
                } catch (err) {
                  console.error("WS parse message failed", err);
                }
              });

              ws.addEventListener("close", () => {
                // Reset generation UI state on socket close
                dispatch(setIsGenerating(false));
                dispatch(setGenerateStatus(null));
                wsRef.current = null;
              });

              ws.addEventListener("error", (err) =>
                console.error("WS error", err)
              );
            } catch (err) {
              console.error("Failed to start generation WS", err);
              dispatch(setIsGenerating(false));
              dispatch(setGenerateStatus(null));
            }
            // e.g., setCollectorDone(true)
            console.log("Collector COMPLETE:", meta.schema);
          },

          onError: (err) => {
            setMessages((prev) => [
              ...prev,
              { role: "assistant", content: `Error: ${err}` },
            ]);
          },

          onDone: (data) => {
            console.log(data);
            setMessages((prev) => {
              const last = prev[prev.length - 1];
              // If assistant already streaming text, keep it
              if (last?.role === "assistant") return prev;

              return [...prev, { role: "assistant", content: assistantText }];
            });

            // Persist assistant final message (avoid duplicates)
            if (!assistantPersistedRef.current && assistantText?.length) {
              console.log(
                "onComplete: persisting assistant message (final)",
                assistantText
              );
              assistantPersistedRef.current = true;
              addToDB({ role: "assistant", content: assistantText }, chatId)
                .then((ok) => console.log("addToDB(onComplete) success", ok))
                .catch((e) => console.error("addToDB onComplete failed", e));
            }
          },
        });
      } finally {
        setResponseLoading(false);
        abortControllerRef.current = null;
      }
    },
    [messages]
  );

  const cancelStream = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setResponseLoading(false);
    }
  }, []);

  const submitResponse = useCallback(
    (id?: string) => {
      console.log("prompt", prompt);
      setResponseLoading(true);
      const chatId = id ?? currentChatId;
      if (!chatId) throw new Error("No chatId provided for submitResponse");
      startStream(chatId, prompt).catch((e) => console.error(e));
      setPrompt("");
    },
    [currentChatId, startStream, prompt]
  );

  useEffect(() => {
    const fetchUserChats = async () => {
      const { chats, error } = await userChats();
      if (!error && chats) setRecentChats(chats as recentChatInterface[]);
    };
    // fetchUserChats();
  }, []);

  // Cleanup websocket on unmount
  useEffect(() => {
    return () => {
      if (wsRef.current) {
        try {
          wsRef.current.close();
        } catch (e) {
          console.error("cleanup ws close failed", e);
        }
        wsRef.current = null;
      }
      dispatch(setIsGenerating(false));
      dispatch(setGenerateStatus(null));
    };
  }, []);

  return {
    prompt,
    setPrompt,
    submitResponse,
    messages,
    hasSubmittedRef,
    fetchChat,
    currentChatId,
    setCurrentChatId,
    cancelStream,
    isResponseLoading,
    recentChats,
    showPreview,
    setShowPreview,
    generatingsite,
    setSiteGenerating,
    changes,
    setChanges,
    generateStatus,
  } as const;
};
