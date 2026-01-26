"use client";
import { functionCallClient } from "@/ai/helpers/functionCallClient";
import {
  generationFinished,
  generationStarted,
  generationUrl,
  resetStatus,
  updatePlan,
  updateStage,
} from "@/lib/features/genUiSlice";
import { AppDispatch, RootState } from "@/lib/store";
import { Message, recentChatInterface, Stage } from "@/types/chat";
import { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  addToDB,
  fetchChatMessages,
  fetchCollectedInfo,
  fetchQuestionAnswers,
  generatePlan,
  streamChatResponse,
  submitAnswers,
  userChats,
} from "../services/chat/chatService";
import { fetchUrl } from "../services/gen/fetchUrl";
import { useChatSession } from "./chatSessionContext";
import { PlanOutput } from "../components/chat/planPreview";

export const useChat = () => {
  const dispatch = useDispatch<AppDispatch>();
  const hasSubmittedRef = useRef(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const [isResponseLoading, setResponseLoading] = useState(false);
  const [changes, setChanges] = useState(false);

  const generatingsite = useSelector(
    (state: RootState) => state.genUi.isGenerating,
  );
  const generationStatus = useSelector(
    (state: RootState) => state.genUi.status,
  );
  const generated = useSelector((state: RootState) => state.genUi.generated);
  const genUrl = useSelector((state: RootState) => state.genUi.url);
  const projectStage = useSelector((state: RootState) => state.genUi.stage);
  const plan = useSelector((state: RootState) => state.genUi.plan);

  const {
    chatId: currentChatId,
    setChatId: setCurrentChatId,
    messages,
    setMessages,
    setQuestions,
    prompt,
    setPrompt,
    recentChatList,
    setRecentChatList,
    questions,
    answers,
    setAnswers,
    collectedInfo,
    setCollectedInfo,
  } = useChatSession();

  const startGeneration = () => {
    dispatch(generationStarted());
  };

  const updateProjectStage = (stage: Stage) => {
    dispatch(updateStage(stage));
  };

  const setGenUrl = (url: string) => dispatch(generationUrl(url));

  const resetGenStatus = () => dispatch(resetStatus());

  const updateQuestionsList = (questions: Questions) => setQuestions(questions);
  const updateAnswers = (answers: UserAnswers[]) => setAnswers(answers);
  const updateCollectedInfo = (collectedInfo: CollectedInfo) =>
    setCollectedInfo(collectedInfo);

  const updateProjectPlan = (plan: PlanOutput) => {
    dispatch(updatePlan(plan));
  };

  const approvePlan = () => {};

  const prepareQARequest = (
    questions: Question[],
    answers: UserAnswers[],
  ): QuestionAnswers[] => {
    return questions.map((question, index) => ({
      question: question.question,
      type: question.type,
      options: question.options,
      chosenAnswer: answers[index].answer,
    }));
  };

  const submitAnswer = async (index: number, navigate: () => void) => {
    if (index === questions.length - 1) {
      updateAnswers(answers);
      await submitAnswers(currentChatId, Object.values(answers));
      // TODO: See if answers were submitted and only then generate plan
      // TODO: Add loading status
      await generatePlan(
        currentChatId,
        projectStage,
        messages,
        collectedInfo,
        prepareQARequest(questions, answers),
      );
    } else {
      navigate();
    }
  };

  const fetchChat = useCallback(async (chatId: string) => {
    resetGenStatus();
    if (!chatId) return;
    setCurrentChatId(chatId);
    const { messages: fetched, stage, error } = await fetchChatMessages(chatId);
    if (!error && fetched && fetched.length > 0) {
      console.log("fetchChat", fetched);
      console.log("stage", stage);
      updateProjectStage(stage);
      setMessages(fetched);
      if (stage === "executer") {
        await fetchUrl(chatId).then((url) => {
          if (url) {
            setGenUrl(url);
          }
        });
      }

      if (stage !== "init") {
        console.log("Fetching data");
        const fetchData = async (projectId: string) => {
          const qa = await fetchQuestionAnswers(projectId);
          if (qa.error) throw new Error(qa.error);
          if (qa.questions && qa.answers) updateQuestionsList(qa.questions);
          updateAnswers(qa.answers);
          const collected_info = await fetchCollectedInfo(projectId);
          if (collected_info.error) throw new Error(collected_info.error);
          if (collected_info.collectedInfo)
            updateCollectedInfo(collected_info.collectedInfo);
        };
        await fetchData(chatId);
      }

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
        {
          role: "user",
          content: prompt,
          msgType: "message",
          stage: projectStage,
        },
      ]);

      addToDB(
        {
          role: "user",
          content: prompt,
          msgType: "message",
          stage: projectStage,
        },
        chatId,
      );

      setResponseLoading(true);
      hasSubmittedRef.current = true;
      try {
        const snapshotForServer: Message[] = [
          ...messages,
          { role: "user", content: prompt } as Message,
        ];

        const response = await streamChatResponse({
          messages: snapshotForServer,
          chatId,
          signal: controller.signal,
          stage: projectStage,
        });

        const assistantText = response.text;

        if (assistantText) {
          setMessages((prev) => [
            ...prev,
            {
              role: "assistant",
              content: assistantText,
              msgType: "message",
              stage: projectStage,
            },
          ]);

          addToDB(
            {
              role: "assistant",
              content: assistantText,
              msgType: "message",
              stage: projectStage,
            },
            chatId,
          )
            .then((ok) => console.log("addToDB(onComplete) success", ok))
            .catch((e) => console.error("addToDB onComplete failed", e));
        }

        if (response.functionCallData) {
          const { name, data } = response.functionCallData;
          console.log("onFunction", data);
          const fnData: any = await functionCallClient(
            name,
            data,
            updateProjectStage,
          );
          let txt = "";
          let type = "";

          if (name === "ask_questions") {
            updateQuestionsList(fnData);
            txt = "Please answer the questions";
            type = "questions";
          }
          if (name === "update_plan") {
            updateProjectPlan(fnData);
            txt = "Project plan";
            type = "plan";
          }
          setMessages((prev) => [
            ...prev,
            {
              role: "assistant",
              content: txt,
              msgType: type,
              stage: projectStage,
            },
          ]);

          addToDB(
            {
              role: "assistant",
              content: txt,
              msgType: type,
              stage: projectStage,
            },
            chatId,
          )
            .then((ok) => console.log("addToDB(onComplete) success", ok))
            .catch((e) => console.error("addToDB onComplete failed", e));
        }
      } finally {
        setResponseLoading(false);
        abortControllerRef.current = null;
      }
    },
    [messages],
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
    [currentChatId, startStream, prompt],
  );

  useEffect(() => {
    const fetchUserChats = async () => {
      const { chats, error } = await userChats();
      if (!error && chats) setRecentChatList(chats as recentChatInterface[]);
    };
    fetchUserChats();
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
    recentChats: recentChatList,
    generatingsite,
    startGeneration,
    changes,
    setChanges,
    generated,
    genUrl,
    generationStatus,
    projectStage,
    questionsList: questions,
    answersList: answers,
    submitAnswer,
    plan,
    approvePlan,
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
