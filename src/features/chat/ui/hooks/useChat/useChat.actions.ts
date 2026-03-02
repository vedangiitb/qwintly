import { UserResponse } from "@/features/ai/types/askQuestions.types";
import { ToolCall } from "@/features/ai/types/tools.types";
import {
  Message,
  MESSAGE_TYPES,
  ROLES,
} from "@/features/chat/types/messages.types";
import { MutableRefObject, useCallback } from "react";
import { ChatContextValue } from "../chatContext";
import { createChat } from "../../services/createChat.service";
import { fetchChatInfo } from "../../services/fetchChatInfo.service";
import { fetchChatMessages } from "../../services/fetchChatMessages.service";
import { fetchChats } from "../../services/fetchChats.service";
import { sendMessage as sendMessageRequest } from "../../services/sendMessage.service";
import { submitAnswers as submitAnswersRequest } from "../../services/submitAnswers.service";
import {
  resolveLatestPlanMessageId,
  toPlanMap,
  toQuestionAnswerMap,
} from "./chatInfo.utils";
import { DEFAULT_MESSAGES_PAGE_SIZE } from "./constants";
import { toErrorMessage } from "./error.utils";
import {
  dedupeAndSortMessages,
  getMessageTypeFromToolCall,
} from "./message.utils";
import { isSupportedUiToolCall } from "./toolCall.utils";
import { useGenerate } from "@/features/generate/ui/hooks/useGenerate";

type ChatActionContext = Pick<
  ChatContextValue,
  | "chatId"
  | "prompt"
  | "messagesCursor"
  | "latestQuestionSetId"
  | "setChatId"
  | "setPrompt"
  | "setMessages"
  | "setQuestionAnswersByMessageId"
  | "setPlansByMessageId"
  | "setLatestQuestionSetId"
  | "setLatestPlanMessageId"
  | "setIsGeneratingResponse"
  | "setRecentChats"
  | "setMessagesCursor"
  | "setHasMoreMessages"
  | "setError"
  | "clearError"
  | "resetActiveChatState"
  | "setUrl"
  | "setIsGenerating"
>;

interface UseChatActionsParams {
  context: ChatActionContext;
  abortControllerRef: MutableRefObject<AbortController | null>;
}

export const useChatActions = ({
  context,
  abortControllerRef,
}: UseChatActionsParams) => {
  const {
    chatId,
    prompt,
    messagesCursor,
    latestQuestionSetId,
    setChatId,
    setPrompt,
    setMessages,
    setQuestionAnswersByMessageId,
    setPlansByMessageId,
    setLatestQuestionSetId,
    setLatestPlanMessageId,
    setIsGeneratingResponse,
    setRecentChats,
    setMessagesCursor,
    setHasMoreMessages,
    setError,
    clearError,
    resetActiveChatState,
    setUrl,
    setIsGenerating,
  } = context;
  const { approvePlan: approveGenerationPlan, clearStatusState } =
    useGenerate();

  const hydrateChatInfo = useCallback(
    async (targetChatId: string) => {
      const { questionAnswers, plans, siteUrl, isGenerating } =
        await fetchChatInfo(targetChatId);
      setQuestionAnswersByMessageId(toQuestionAnswerMap(questionAnswers));
      setPlansByMessageId(toPlanMap(plans));
      setLatestQuestionSetId(questionAnswers[0]?.id ?? null);
      setLatestPlanMessageId(resolveLatestPlanMessageId(plans));
      setUrl(siteUrl);
      setIsGenerating(isGenerating);
      return { questionAnswers, plans };
    },
    [
      setQuestionAnswersByMessageId,
      setPlansByMessageId,
      setLatestQuestionSetId,
      setLatestPlanMessageId,
    ],
  );

  const loadRecentChats = useCallback(
    async (params?: { limit?: number; cursor?: string }) => {
      clearError();
      try {
        const result = await fetchChats(params);
        setRecentChats(result.chats);
      } catch (err) {
        const message = toErrorMessage(err, "Failed to load recent chats.");
        setError(message);
        throw err;
      }
    },
    [clearError, setError, setRecentChats],
  );

  const loadChat = useCallback(
    async (targetChatId: string, opts?: { reset?: boolean }) => {
      const shouldReset = opts?.reset ?? true;

      if (!targetChatId?.trim()) {
        const message = "Missing or invalid chatId.";
        setError(message);
        throw new Error(message);
      }

      clearError();

      if (shouldReset) {
        resetActiveChatState();
        clearStatusState();
      }
      setChatId(targetChatId);

      try {
        const [messagesResult] = await Promise.all([
          fetchChatMessages({
            chatId: targetChatId,
            limit: DEFAULT_MESSAGES_PAGE_SIZE,
          }),
          hydrateChatInfo(targetChatId),
        ]);

        setMessages(dedupeAndSortMessages(messagesResult.messages));
        setMessagesCursor(messagesResult.nextCursor);
        setHasMoreMessages(Boolean(messagesResult.nextCursor));
      } catch (err) {
        const message = toErrorMessage(err, "Failed to load chat.");
        setError(message);
        throw err;
      }
    },
    [
      clearError,
      setChatId,
      resetActiveChatState,
      clearStatusState,
      hydrateChatInfo,
      setMessages,
      setMessagesCursor,
      setHasMoreMessages,
      setError,
    ],
  );

  const handleToolCall = useCallback(
    async (toolCall: ToolCall, targetChatId: string) => {
      if (!isSupportedUiToolCall(toolCall)) {
        console.warn(`Unhandled tool call: ${toolCall.name}`);
        return;
      }

      try {
        // TODO: Check which tool is called to determine which info to fetch, to reduce latency
        await hydrateChatInfo(targetChatId);
      } catch (err) {
        const message = toErrorMessage(
          err,
          "Failed to refresh chat info after tool call.",
        );
        setError(message);
      }
    },
    [hydrateChatInfo, setError],
  );

  const appendUserMessage = useCallback(
    (type: Message["type"], content: string) => {
      const userMessage: Message = {
        id: `temp-user-${Date.now()}`,
        role: ROLES.USER,
        type,
        content,
        createdAt: new Date().toISOString(),
      };
      setPrompt("");
      setMessages((prev) => dedupeAndSortMessages([...prev, userMessage]));
    },
    [setPrompt, setMessages],
  );

  const appendAssistantMessage = useCallback(
    (params: {
      agentMessageId?: string;
      response: string;
      toolCall?: ToolCall;
    }) => {
      const assistantMessage: Message = {
        id: params.agentMessageId || `temp-model-${Date.now()}`,
        role: ROLES.MODEL,
        type: getMessageTypeFromToolCall(params.toolCall),
        content: params.response,
        createdAt: new Date().toISOString(),
      };

      setMessages((prev) =>
        dedupeAndSortMessages([...prev, assistantMessage]),
      );
    },
    [setMessages],
  );

  const handleAssistantResponse = useCallback(
    async (params: {
      agentMessageId?: string;
      response: string;
      toolCall?: ToolCall;
      targetChatId: string;
    }) => {
      appendAssistantMessage(params);
      if (params.toolCall) {
        await handleToolCall(params.toolCall, params.targetChatId);
      }
    },
    [appendAssistantMessage, handleToolCall],
  );

  const sendMessage = useCallback(
    async (message?: string) => {
      const promptSnapshot = prompt;
      const outgoingMessage = (message ?? promptSnapshot).trim();

      if (!outgoingMessage) return;

      clearError();
      abortControllerRef.current?.abort();
      const controller = new AbortController();
      abortControllerRef.current = controller;
      setIsGeneratingResponse(true);

      let activeChatId = chatId;

      try {
        if (!activeChatId) {
          const created = await createChat({ prompt: outgoingMessage });
          activeChatId = created.chatId;
          setChatId(activeChatId);

          void loadRecentChats().catch(() => {
            // intentionally ignored; list refresh is best-effort
          });
        }

        appendUserMessage(MESSAGE_TYPES.MESSAGE, outgoingMessage);

        const response = await sendMessageRequest({
          chatId: activeChatId,
          message: outgoingMessage,
          signal: controller.signal,
        });

        await handleAssistantResponse({
          agentMessageId: response.agentMessageId,
          response: response.response,
          toolCall: response.toolCall,
          targetChatId: activeChatId,
        });
      } catch (err) {
        if (
          err instanceof Error &&
          (err.name === "AbortError" || err.message.includes("aborted"))
        ) {
          return;
        }

        const errorMessage = toErrorMessage(err, "Failed to send message.");
        setError(errorMessage);
        throw err;
      } finally {
        if (abortControllerRef.current === controller) {
          abortControllerRef.current = null;
        }
        setIsGeneratingResponse(false);
      }
    },
    [
      prompt,
      clearError,
      setIsGeneratingResponse,
      chatId,
      setChatId,
      loadRecentChats,
      appendUserMessage,
      handleAssistantResponse,
      setError,
      abortControllerRef,
    ],
  );

  const submitAnswers = useCallback(
    async (params: { answers: UserResponse[]; questionSetId?: string }) => {
      if (!chatId) {
        const message = "No active chat selected.";
        setError(message);
        throw new Error(message);
      }

      clearError();
      setIsGeneratingResponse(true);

      const resolvedQuestionSetId =
        params.questionSetId?.trim() || latestQuestionSetId || undefined;

      try {
        appendUserMessage(MESSAGE_TYPES.QUESTIONS, "Answers Submitted");

        const response = await submitAnswersRequest({
          chatId,
          answers: params.answers,
          questionSetId: resolvedQuestionSetId,
        });

        await handleAssistantResponse({
          agentMessageId: response.agentMessageId,
          response: response.response,
          toolCall: response.toolCall,
          targetChatId: chatId,
        });
        setLatestQuestionSetId(response.questionSetId);

        setQuestionAnswersByMessageId((prev) => {
          const entries = Object.entries(prev);
          const matchingEntry = entries.find(
            ([, questionAnswer]) =>
              questionAnswer.id === response.questionSetId,
          );
          if (!matchingEntry) return prev;

          const [messageId, questionAnswer] = matchingEntry;
          return {
            ...prev,
            [messageId]: {
              ...questionAnswer,
              status: response.status,
            },
          };
        });

      } catch (err) {
        const message = toErrorMessage(err, "Failed to submit answers.");
        setError(message);
        throw err;
      } finally {
        setIsGeneratingResponse(false);
      }
    },
    [
      chatId,
      latestQuestionSetId,
      clearError,
      setIsGeneratingResponse,
      setLatestQuestionSetId,
      setQuestionAnswersByMessageId,
      appendUserMessage,
      handleAssistantResponse,
      setError,
    ],
  );

  const loadOlderMessages = useCallback(async () => {
    if (!chatId || !messagesCursor) return;

    clearError();
    try {
      const response = await fetchChatMessages({
        chatId,
        cursor: messagesCursor,
        limit: DEFAULT_MESSAGES_PAGE_SIZE,
      });

      setMessages((prev) =>
        dedupeAndSortMessages([...response.messages, ...prev]),
      );
      setMessagesCursor(response.nextCursor);
      setHasMoreMessages(Boolean(response.nextCursor));
    } catch (err) {
      const message = toErrorMessage(err, "Failed to load older messages.");
      setError(message);
      throw err;
    }
  }, [
    chatId,
    messagesCursor,
    clearError,
    setMessages,
    setMessagesCursor,
    setHasMoreMessages,
    setError,
  ]);

  const approvePlan = useCallback(async () => {
    clearError();

    try {
      await approveGenerationPlan(chatId);
    } catch (err) {
      const message = toErrorMessage(err, "Failed to approve plan.");
      setError(message);
    }
  }, [chatId, clearError, approveGenerationPlan, setError]);

  return {
    loadRecentChats,
    loadChat,
    loadOlderMessages,
    sendMessage,
    submitAnswers,
    approvePlan,
  } as const;
};
