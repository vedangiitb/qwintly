"use client";
import { functionCallClient } from "@/ai/helpers/functionCallClient";
import {
  generationFinished,
  generationStarted,
  generationStatusUpdated,
  generationUrl,
  resetStatus,
  updateCurrPlan,
  updatePlans,
  updateStage,
} from "@/lib/features/genUiSlice";
import { AppDispatch, RootState } from "@/lib/store";
import { Message, recentChatInterface, Stage } from "@/types/chat";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { PlanOutput } from "../components/chat/planPreview";
import {
  addToDB,
  fetchChatMessages,
  fetchCollectedInfo,
  fetchQuestionAnswers,
  fetchTasks,
  generatePlan,
  streamChatResponse,
  submitAnswers,
  TaskRow,
  userChats,
} from "../services/chat/chatService";
import { fetchUrl } from "../services/gen/fetchUrl";
import { startGen } from "../services/gen/startGen";
import { fetchGenerationStatus } from "../services/gen/updateStatus";
import { useChatSession } from "./chatSessionContext";

export const useChat = () => {
  const dispatch = useDispatch<AppDispatch>();
  const hasSubmittedRef = useRef(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
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
  const plans = useSelector((state: RootState) => state.genUi.plans);
  const currPlan = useSelector((state: RootState) => state.genUi.currPlan);

  console.log(projectStage, "projectStage");

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
    isResponseLoading,
    setResponseLoading,
    setAnswersSubmitted,
  } = useChatSession();

  const updateProjectStage = (stage: Stage) => {
    dispatch(updateStage(stage));
  };

  const updateStatus = (status: string) =>
    dispatch(generationStatusUpdated(status));

  const setGenUrl = (url: string) => dispatch(generationUrl(url));

  const resetGenStatus = () => dispatch(resetStatus());

  const finishGeneration = () => dispatch(generationFinished());

  const updateQuestionsList = (questions: Questions) => setQuestions(questions);
  const updateAnswers = (answers: UserAnswers[]) => setAnswers(answers);
  const updateCollectedInfo = (collectedInfo: CollectedInfo) =>
    setCollectedInfo(collectedInfo);

  const updateProjectPlans = (plan: PlanOutput[]) => {
    dispatch(updatePlans(plan));
  };

  const updateProjectPlan = (plan: PlanOutput) => {
    if (!currentChatId)
      throw new Error("currentChatId not found in updateProjectPlan");
    dispatch(updateCurrPlan(plan));
  };

  const approvePlan = () => {
    dispatch(generationStarted());

    startGen(currentChatId, currPlan.tasks, collectedInfo);

    fetchGenerationStatus(
      wsRef,
      currentChatId,
      updateStatus,
      setGenUrl,
      finishGeneration,
    );
  };

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

  const submitAnswer = async (
    index: number,
    navigate: () => void,
    setSubmitting: React.Dispatch<React.SetStateAction<boolean>>,
  ) => {
    if (index === questions.length - 1) {
      setSubmitting(true);
      setResponseLoading(true);
      updateAnswers(answers);
      await submitAnswers(currentChatId, Object.values(answers));
      // TODO: See if answers were submitted and only then generate plan
      // TODO: Add loading status
      const response = await generatePlan(
        currentChatId,
        projectStage,
        messages,
        collectedInfo,
        prepareQARequest(questions, answers),
      );
      if (response.error) {
        setSubmitting(false);
        throw new Error(response.error);
      }

      setAnswersSubmitted(true);

      if (response.functionCallData) {
        handleFunctionCall(response.functionCallData, currentChatId);
      }
      setResponseLoading(false);
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
      updateProjectStage(stage);
      setMessages(fetched);
      // TODO: After implementing stage update on website genration check only if stage=="executer"
      if (stage === "executer" || stage === "planner") {
        await fetchUrl(chatId).then((url) => {
          if (url) {
            setGenUrl(url);
          }
        });
      }

      if (stage !== "init") {
        const fetchData = async (projectId: string) => {
          const qa = await fetchQuestionAnswers(projectId);
          if (qa.error) throw new Error(qa.error);
          if (qa.questions && qa.answers) updateQuestionsList(qa.questions);
          updateAnswers(qa.answers);
          setAnswersSubmitted(qa.submitted);
          const collected_info = await fetchCollectedInfo(projectId);
          if (collected_info.error) throw new Error(collected_info.error);
          if (collected_info.collectedInfo)
            updateCollectedInfo(collected_info.collectedInfo);
        };
        await fetchData(chatId);
      }

      if (stage === "planner") {
        const fetchPlan = async (projectId: string) => {
          const plan: { data: TaskRow[] | null; error: string } =
            await fetchTasks(projectId);
          if (plan.error) throw new Error(plan.error);
          if (plan.data)
            updateProjectPlans(
              plan.data.map((task) => ({
                tasks: task.tasks ?? [],
                newInfo: task.info ?? null,
                implemented: task.implemented ?? false,
              })),
            );

          dispatch(
            updateCurrPlan({ ...plan.data[0], newInfo: plan.data[0].info }),
          );
        };
        await fetchPlan(chatId);
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
          {
            role: "user",
            content: prompt,
            msgType: "message",
            stage: projectStage,
          },
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
              role: "model",
              content: assistantText,
              msgType: "message",
              stage: projectStage,
            },
          ]);

          addToDB(
            {
              role: "model",
              content: assistantText,
              msgType: "message",
              stage: projectStage,
            },
            chatId,
          ).catch((e) => console.error("addToDB onComplete failed", e));
        }
        if (response.functionCallData) {
          await handleFunctionCall(response.functionCallData, chatId);
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

  const handleFunctionCall = async (
    functionCallData: any,
    chatIdOverride?: string | null,
  ) => {
    const effectiveChatId = chatIdOverride ?? currentChatId;
    const { name, data } = functionCallData;
    const fnData: any = await functionCallClient(
      name,
      data,
      updateProjectStage,
    );
    let txt = "";
    let type = "message";

    if (name === "ask_questions") {
      updateQuestionsList(fnData);
      const answers = fnData.map((question: Question) => ({
        id: question.id,
        answer: "",
      }));
      updateAnswers(answers);
      txt = "Please answer the questions";
      type = "questions";
    }
    if (name === "update_plan") {
      const newCollectedInfo = fnData.newInfo;
      updateCollectedInfo(newCollectedInfo);
      updateProjectPlan({
        tasks: fnData.tasks,
        newInfo: fnData.newInfo,
        implemented: false,
      });
      txt = "Project plan";
      type = "plan";
    }
    setMessages((prev) => [
      ...prev,
      {
        role: "model",
        content: txt,
        msgType: type,
        stage: projectStage,
      },
    ]);

    if (!effectiveChatId) {
      console.error("handleFunctionCall missing chatId");
      return;
    }

    addToDB(
      {
        role: "model",
        content: txt,
        msgType: type,
        stage: projectStage,
      },
      effectiveChatId,
    ).catch((e) => console.error("addToDB onComplete failed", e));
  };

  const submitResponse = useCallback(
    (id?: string) => {
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
    changes,
    setChanges,
    generated,
    genUrl,
    generationStatus,
    projectStage,
    questionsList: questions,
    answersList: answers,
    submitAnswer,
    currPlan,
    approvePlan,
  } as const;
};
