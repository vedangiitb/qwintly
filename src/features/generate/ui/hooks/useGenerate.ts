"use client";

import { useCallback } from "react";
import {
  generateClient,
  GenerationRealtimeStatusEvent,
  GenerationStatusHistoryEvent,
  GenerationStreamEvent,
} from "../api/generate.client";
import { useGenerateContext } from "./useGenerateContext";
import { GenerationStatusLog } from "../../generate.types";

const TERMINAL_EVENTS = new Set(["generation_completed", "generation_failed"]);

const safeTrim = (value: string | null | undefined): string | null => {
  if (!value) return null;
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
};

const titleFromEventType = (eventType: string): string =>
  eventType
    .split("_")
    .filter(Boolean)
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join(" ");

const resolveStatusText = (
  event: GenerationRealtimeStatusEvent,
): string | null =>
  safeTrim(event.message) ??
  safeTrim(event.step) ??
  titleFromEventType(event.event_type);

const toHistoryLog = (
  event: GenerationStatusHistoryEvent,
): GenerationStatusLog => ({
  eventType: event.event_type,
  step: event.step ?? null,
  message: event.message ?? null,
  seqNum: Number.isFinite(event.seq_num) ? event.seq_num : null,
  createdAt: event.created_at,
});

const toRealtimeLog = (
  event: GenerationRealtimeStatusEvent,
): GenerationStatusLog => ({
  eventType: event.event_type,
  step: safeTrim(event.step),
  message: safeTrim(event.message),
  seqNum: event.seq_num ? Number(event.seq_num) || null : null,
  createdAt: event.created_at ?? new Date().toISOString(),
});

export const useGenerate = () => {
  const {
    activeChatId,
    isGenerating,
    currentStatus,
    statusLogs,
    error,
    setActiveChatId,
    setGenerating,
    setCurrentStatus,
    setStatusLogs,
    appendStatusLog,
    clearStatusState,
    setGenerateError,
    url,
  } = useGenerateContext();

  const handleStreamEvent = useCallback(
    (streamEvent: GenerationStreamEvent) => {
      if (streamEvent.type === "history") {
        const logs = streamEvent.payload.map(toHistoryLog);
        setStatusLogs(logs);
        const lastEventType = logs.length
          ? logs[logs.length - 1].eventType
          : null;
        if (lastEventType) {
          setGenerating(!TERMINAL_EVENTS.has(lastEventType));
        }
        return;
      }

      if (streamEvent.type === "current_status") {
        const status = safeTrim(streamEvent.payload);
        setCurrentStatus(status);
        if (status) {
          setGenerating(!TERMINAL_EVENTS.has(status));
        }
        return;
      }

      if (streamEvent.type === "event") {
        const log = toRealtimeLog(streamEvent.payload);
        appendStatusLog(log);
        setCurrentStatus(resolveStatusText(streamEvent.payload));

        if (TERMINAL_EVENTS.has(streamEvent.payload.event_type)) {
          setGenerating(false);
        } else {
          setGenerating(true);
        }
      }
    },
    [appendStatusLog, setCurrentStatus, setGenerating, setStatusLogs],
  );

  const approvePlan = useCallback(
    async (chatId: string) => {
      setGenerateError(null);
      setActiveChatId(chatId);
      try {
        await generateClient.approvePlan({ chatId });
        setGenerating(true);
        setCurrentStatus("Queued for generation");
      } catch (err) {
        setGenerating(false);
        throw err;
      }
    },
    [setGenerateError, setActiveChatId, setGenerating, setCurrentStatus],
  );

  const streamGenerationStatus = useCallback(
    async (params: { chatId: string; signal?: AbortSignal }) => {
      const { chatId } = params;

      setGenerateError(null);
      setActiveChatId(chatId);

      try {
        await generateClient.streamGenerationStatus({
          chatId: chatId,
          signal: params.signal,
          onEvent: handleStreamEvent,
        });
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") {
          return;
        }

        setGenerateError(
          err instanceof Error
            ? err.message
            : "Failed to fetch generation status.",
        );
        throw err;
      }
    },
    [setGenerateError, setActiveChatId, handleStreamEvent],
  );

  return {
    activeChatId,
    isGenerating,
    currentStatus,
    statusLogs,
    error,
    approvePlan,
    streamGenerationStatus,
    clearStatusState,
    setGenerating,
    url,
  } as const;
};
