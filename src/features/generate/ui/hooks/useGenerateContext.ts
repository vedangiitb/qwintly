"use client";

import { useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/lib/store";
import {
  appendStatusLog,
  clearStatusState,
  setActiveChatId,
  setCurrentStatus,
  setGenerateError,
  setGenerating,
  setStatusLogs,
} from "@/lib/features/generateSlice";
import { GenerationStatusLog } from "../../generate.types";

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
  const onSetCurrentStatus = useCallback(
    (value: string | null) => dispatch(setCurrentStatus(value)),
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
  const onClearStatusState = useCallback(() => dispatch(clearStatusState()), [dispatch]);
  const onSetGenerateError = useCallback(
    (error: string | null) => dispatch(setGenerateError(error)),
    [dispatch],
  );

  return useMemo(
    () =>
      ({
        ...generateState,
        setActiveChatId: onSetActiveChatId,
        setGenerating: onSetGenerating,
        setCurrentStatus: onSetCurrentStatus,
        setStatusLogs: onSetStatusLogs,
        appendStatusLog: onAppendStatusLog,
        clearStatusState: onClearStatusState,
        setGenerateError: onSetGenerateError,
      }) as const,
    [
      generateState,
      onSetActiveChatId,
      onSetGenerating,
      onSetCurrentStatus,
      onSetStatusLogs,
      onAppendStatusLog,
      onClearStatusState,
      onSetGenerateError,
    ],
  );
};
