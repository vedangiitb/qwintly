"use client";

import { useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/lib/store";
import {
  applyHistoryLogs,
  applyRealtimeLog,
  appendStatusLog,
  clearStatusState,
  setActiveChatId,
  setCurrentLog,
  setGenerateError,
  setGenerating,
  setPreviewUrl,
  setSiteUrl,
  setStatusLogs,
  setSessionId,
} from "@/lib/features/generateSlice";
import { GenerationStatusLog } from "../../types/generate.types";

const normalizeSiteUrl = (value: string | null): string | null => {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;

  if (trimmed.startsWith("/")) return trimmed;

  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (trimmed.startsWith("//")) return `https:${trimmed}`;

  try {
    // eslint-disable-next-line no-new
    new URL(`https://${trimmed}`);
    return `https://${trimmed}`;
  } catch {
    return trimmed;
  }
};

export const useGenerateContext = () => {
  const dispatch = useDispatch<AppDispatch>();
  const generateState = useSelector((state: RootState) => state.generate);

  const onSetActiveChatId = useCallback(
    (chatId: string | null) => dispatch(setActiveChatId(chatId)),
    [dispatch],
  );
  const onSetGenerating = useCallback(
    (value: boolean) => dispatch(setGenerating(value)),
    [dispatch],
  );
  const onSetCurrentLog = useCallback(
    (value: GenerationStatusLog | null) => dispatch(setCurrentLog(value)),
    [dispatch],
  );
  const onApplyHistoryLogs = useCallback(
    (logs: GenerationStatusLog[]) => dispatch(applyHistoryLogs(logs)),
    [dispatch],
  );
  const onApplyRealtimeLog = useCallback(
    (log: GenerationStatusLog) => dispatch(applyRealtimeLog(log)),
    [dispatch],
  );
  const onSetStatusLogs = useCallback(
    (logs: GenerationStatusLog[]) => dispatch(setStatusLogs(logs)),
    [dispatch],
  );
  const onAppendStatusLog = useCallback(
    (log: GenerationStatusLog) => dispatch(appendStatusLog(log)),
    [dispatch],
  );
  const onClearStatusState = useCallback(
    () => dispatch(clearStatusState()),
    [dispatch],
  );
  const onSetGenerateError = useCallback(
    (error: string | null) => dispatch(setGenerateError(error)),
    [dispatch],
  );
  const onSetSiteUrl = useCallback(
    (value: string | null) => dispatch(setSiteUrl(normalizeSiteUrl(value))),
    [dispatch],
  );
  const onSetSessionId = useCallback(
    (value: string | null) => dispatch(setSessionId(value)),
    [dispatch],
  );
  const onSetPreviewUrl = useCallback(
    (value: string | null) => dispatch(setPreviewUrl(normalizeSiteUrl(value))),
    [dispatch],
  );

  return useMemo(
    () =>
      ({
        ...generateState,
        setActiveChatId: onSetActiveChatId,
        setGenerating: onSetGenerating,
        setCurrentLog: onSetCurrentLog,
        applyHistoryLogs: onApplyHistoryLogs,
        applyRealtimeLog: onApplyRealtimeLog,
        setSiteUrl: onSetSiteUrl,
        setStatusLogs: onSetStatusLogs,
        appendStatusLog: onAppendStatusLog,
        clearStatusState: onClearStatusState,
        setGenerateError: onSetGenerateError,
        setSessionId: onSetSessionId,
        setPreviewUrl: onSetPreviewUrl,
      }) as const,
    [
      generateState,
      onSetActiveChatId,
      onSetGenerating,
      onSetCurrentLog,
      onApplyHistoryLogs,
      onApplyRealtimeLog,
      onSetSiteUrl,
      onSetStatusLogs,
      onAppendStatusLog,
      onClearStatusState,
      onSetGenerateError,
      onSetSessionId,
      onSetPreviewUrl,
    ],
  );
};
