"use client";
import { functionCallClient } from "@/ai/helpers/functionCallClient";
import { stages } from "@/ai/helpers/getPrompt";
import {
  generationFinished,
  generationStarted,
  generationUrl,
  resetStatus,
} from "@/lib/features/genUiSlice";
import { setChatPrompt } from "@/lib/features/promptSlice";
import { AppDispatch, RootState } from "@/lib/store";
import { Message, recentChatInterface, Stage } from "@/types/chat";
import { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  addToDB,
  fetchChatMessages,
  streamChatResponse,
  userChats,
} from "../../services/chat/chatService";
import { fetchUrl } from "../../services/gen/fetchUrl";

export const useChat = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const hasSubmittedRef = useRef(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const assistantPersistedRef = useRef(false);
  const [isResponseLoading, setResponseLoading] = useState(false);
  const [recentChats, setRecentChats] = useState<recentChatInterface[]>([]);
  const generatingsite = useSelector(
    (state: RootState) => state.genUi.isGenerating
  );
  const generatingStatus = useSelector(
    (state: RootState) => state.genUi.status
  );
  const genUrl = useSelector((state: RootState) => state.genUi.url);
  const generateStatus = useSelector(
    (state: RootState) => state.genUi.generated
  );
  const prompt = useSelector((state: RootState) => state.prompt.prompt);
  const [changes, setChanges] = useState(false);

  const setPrompt: (p: string) => any = (p: string) => {
    dispatch(setChatPrompt(p));
  };

  const startGeneration = () => {
    dispatch(generationStarted());
  };

  const setGenUrl = (url: string) => dispatch(generationUrl(url));

  const resetGenStatus = () => dispatch(resetStatus());

  const fetchChat = useCallback(async (chatId: string) => {
    resetGenStatus();
    if (!chatId) return;
    setCurrentChatId(chatId);
    const { messages: fetched, error } = await fetchChatMessages(chatId);
    if (!error && fetched && fetched.length > 0) {
      setMessages(fetched);
      await fetchUrl(chatId).then((url) => {
        if (url) {
          setGenUrl(url);
        } else {
        }
      });
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

      abortControllerRef.current?.abort();
      const controller = new AbortController();
      abortControllerRef.current = controller;

      setMessages((prev) => [
        ...prev,
        { role: "user", content: prompt, msgType: "message" },
      ]);

      addToDB({ role: "user", content: prompt, msgType: "message" }, chatId);

      setResponseLoading(true);
      hasSubmittedRef.current = true;
      assistantPersistedRef.current = false;

      try {
        const snapshotForServer: Message[] = [
          ...messages,
          { role: "user", content: prompt } as Message,
        ];

        const response = await streamChatResponse({
          messages: snapshotForServer,
          chatId,
          signal: controller.signal,
          stage: "init",
        });

        const assistantText = response.text;

        if (assistantText) {
          setMessages((prev) => [
            ...prev,
            { role: "assistant", content: assistantText, msgType: "message" },
          ]);

          addToDB(
            { role: "assistant", content: assistantText, msgType: "message" },
            chatId
          )
            .then((ok) => console.log("addToDB(onComplete) success", ok))
            .catch((e) => console.error("addToDB onComplete failed", e));
        }

        if (response.functionCallData) {
          const { name, data } = response.functionCallData;
          console.log("onFunction", data);
          const fnData: Questions = await functionCallClient(name, data);
          setMessages((prev) => [
            ...prev,
            { role: "assistant", content: fnData, msgType: "message" },
          ]);
        }
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
      dispatch(generationFinished());
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
    generatingsite,
    startGeneration,
    changes,
    setChanges,
    generateStatus,
    genUrl,
    generatingStatus,
  } as const;
};

// onComplete: (meta) => {
//   finalSchema = meta.schema;
//   console.log(finalSchema);

//   setMessages((prev) => {
//     const last = prev[prev.length - 1];
//     if (last?.role === "assistant") return prev;

//     return [...prev, { role: "assistant", content: assistantText }];
//   });

//   if (!assistantPersistedRef.current && assistantText?.length) {
//     console.log(
//       "onComplete: persisting assistant message (final)",
//       assistantText
//     );
//     assistantPersistedRef.current = true;
//     addToDB({ role: "assistant", content: assistantText }, chatId)
//       .then((ok) => console.log("addToDB(onComplete) success", ok))
//       .catch((e) => console.error("addToDB onComplete failed", e));
//   }

//   startGeneration();

//   try {
//     if (wsRef.current) {
//       try {
//         wsRef.current.close();
//       } catch (e) {
//         console.error("ws close failed", e);
//       }
//       wsRef.current = null;
//     }

//     const sessionId = chatId;

//     const workerUrl =
//       "wss://qwintly-wg-worker-296200543960.asia-south1.run.app";
//     const wsUrl = `${workerUrl}/ws/${sessionId}`;
//     const ws = new WebSocket(wsUrl);
//     wsRef.current = ws;

//     console.log("wsUrl", wsUrl);

//     ws.addEventListener("open", () =>
//       console.log("WS open for session", sessionId, wsUrl)
//     );

//     ws.addEventListener("message", (e) => {
//       try {
//         const msg = String(e.data);
//         dispatch(generationStatusUpdated(msg));

//         if (typeof msg === "string" && msg === "SUCCESS") {
//           fetchUrl(chatId).then((url) => setGenUrl(url));
//           try {
//             ws.close();
//           } catch (err) {
//             console.error("ws close after SUCCESS failed", err);
//           }
//         }
//       } catch (err) {
//         console.error("WS parse message failed", err);
//       }
//     });

//     ws.addEventListener("close", () => {
//       dispatch(generationFinished());
//       wsRef.current = null;
//     });

//     ws.addEventListener("error", (err) =>
//       console.error("WS error", err)
//     );
//   } catch (err) {
//     console.error("Failed to start generation WS", err);
//     dispatch(generationFinished());
//   }
//   console.log("Collector COMPLETE:", meta.schema);
// },
