"use client";

import { useCallback, useRef } from "react";
import {
  generateClient,
  GenerationRealtimeStatusEvent,
  GenerationStatusHistoryEvent,
  GenerationStreamEvent,
} from "../api/generate.client";
import { useGenerateContext } from "./useGenerateContext";
import { GenerationStatusLog } from "../../generate.types";
import { fetchChatInfo } from "@/features/chat/ui/services/fetchChatInfo.service";

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

const resolveStatusTextFromLog = (log: GenerationStatusLog | null): string | null => {
  if (!log) return null;
  return safeTrim(log.message) ?? safeTrim(log.step) ?? titleFromEventType(log.eventType);
};

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
    currentLog,
    statusLogs,
    error,
    setActiveChatId,
    setGenerating,
    setCurrentLog,
    applyHistoryLogs,
    applyRealtimeLog,
    clearStatusState,
    setGenerateError,
    setSiteUrl,
    url,
  } = useGenerateContext();

  const urlFetchInFlightRef = useRef<Set<string>>(new Set());

  const hydrateSiteUrl = useCallback(
    async (chatId: string) => {
      if (!chatId?.trim()) return;
      if (urlFetchInFlightRef.current.has(chatId)) return;

      urlFetchInFlightRef.current.add(chatId);
      try {
        const info = await fetchChatInfo(chatId);
        setSiteUrl(info.siteUrl ?? null);
      } catch {
        // Best-effort: URL hydration shouldn't fail generation UX.
      } finally {
        urlFetchInFlightRef.current.delete(chatId);
      }
    },
    [setSiteUrl],
  );

  const handleStreamEvent = useCallback(
    (streamEvent: GenerationStreamEvent, chatId: string) => {
      if (streamEvent.type === "history") {
        const logs = streamEvent.payload.map(toHistoryLog);
        applyHistoryLogs(logs);
        const lastEventType = logs.length ? logs[logs.length - 1]?.eventType : null;
        const isTerminal = lastEventType ? TERMINAL_EVENTS.has(lastEventType) : false;
        setGenerating(lastEventType ? !isTerminal : true);
        if (isTerminal) {
          void hydrateSiteUrl(chatId);
        }
        return;
      }

      if (streamEvent.type === "current") {
        const log = toRealtimeLog(streamEvent.payload);
        setCurrentLog(log);
        const isTerminal = TERMINAL_EVENTS.has(log.eventType);
        setGenerating(!isTerminal);
        if (isTerminal) {
          void hydrateSiteUrl(chatId);
        }
        return;
      }

      if (streamEvent.type === "event") {
        const log = toRealtimeLog(streamEvent.payload);
        applyRealtimeLog(log);
        const isTerminal = TERMINAL_EVENTS.has(log.eventType);
        setGenerating(!isTerminal);
        if (isTerminal) {
          void hydrateSiteUrl(chatId);
        }
      }
    },
    [applyHistoryLogs, applyRealtimeLog, hydrateSiteUrl, setCurrentLog, setGenerating],
  );

  const approvePlan = useCallback(
    async (chatId: string, planId: string) => {
      setGenerateError(null);
      setActiveChatId(chatId);
      setSiteUrl(null);
      try {
        await generateClient.approvePlan({ chatId, planId });
        setGenerating(true);
        setCurrentLog({
          eventType: "generation_queued",
          step: "Queued",
          message: "Queued for generation",
          seqNum: null,
          createdAt: new Date().toISOString(),
        });
      } catch (err) {
        setGenerating(false);
        throw err;
      }
    },
    [setGenerateError, setActiveChatId, setGenerating, setCurrentLog, setSiteUrl],
  );

  const streamGenerationStatus = useCallback(
    async (params: { chatId: string; signal?: AbortSignal }) => {
      const { chatId } = params;

      setGenerateError(null);
      setActiveChatId(chatId);
      setSiteUrl(null);

      try {
        await generateClient.streamGenerationStatus({
          chatId: chatId,
          signal: params.signal,
          onEvent: (event) => handleStreamEvent(event, chatId),
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
    currentLog,
    currentStatus: resolveStatusTextFromLog(currentLog),
    statusLogs,
    error,
    approvePlan,
    streamGenerationStatus,
    clearStatusState,
    setGenerating,
    setActiveChatId,
    setSiteUrl,
    url,
  } as const;
};
