import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { GenerationStatusLog } from "@/features/generate/generate.types";

interface GenerateState {
  activeChatId: string | null;
  isGenerating: boolean;
  isSessionRunning: boolean;
  currentLog: GenerationStatusLog | null;
  statusLogs: GenerationStatusLog[];
  sessionId: string | null;
  previewUrl: string | null;
  url: string | null;
  error: string | null;
}

const initialState: GenerateState = {
  activeChatId: null,
  isGenerating: false,
  isSessionRunning: false,
  currentLog: null,
  statusLogs: [],
  sessionId: null,
  url: null,
  previewUrl: null,
  error: null,
};

const generateSlice = createSlice({
  name: "generate",
  initialState,
  reducers: {
    setActiveChatId(state, action: PayloadAction<string | null>) {
      state.activeChatId = action.payload;
    },
    setGenerating(state, action: PayloadAction<boolean>) {
      state.isGenerating = action.payload;
      state.isSessionRunning = action.payload;
    },
    setCurrentLog(state, action: PayloadAction<GenerationStatusLog | null>) {
      state.currentLog = action.payload;
    },
    setSessionId(state, action: PayloadAction<string | null>) {
      state.sessionId = action.payload;
    },
    setPreviewUrl(state, action: PayloadAction<string | null>) {
      state.previewUrl = action.payload;
    },
    applyHistoryLogs(state, action: PayloadAction<GenerationStatusLog[]>) {
      const logs = action.payload;
      if (!logs.length) {
        state.currentLog = null;
        state.statusLogs = [];
        return;
      }

      state.currentLog = logs[logs.length - 1] ?? null;
      state.statusLogs = logs.slice(0, -1);
    },
    applyRealtimeLog(state, action: PayloadAction<GenerationStatusLog>) {
      if (state.currentLog) {
        state.statusLogs.push(state.currentLog);
      }
      state.currentLog = action.payload;
    },
    setStatusLogs(state, action: PayloadAction<GenerationStatusLog[]>) {
      state.statusLogs = action.payload;
    },
    appendStatusLog(state, action: PayloadAction<GenerationStatusLog>) {
      state.statusLogs.push(action.payload);
    },
    clearStatusState(state) {
      state.currentLog = null;
      state.statusLogs = [];
      state.error = null;
      state.isGenerating = false;
      state.isSessionRunning = false;
    },
    setGenerateError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
    },
    setSiteUrl(state, action: PayloadAction<string | null>) {
      state.url = action.payload;
    },
  },
});

export const {
  setActiveChatId,
  setGenerating,
  setCurrentLog,
  applyHistoryLogs,
  setSessionId,
  setPreviewUrl,
  applyRealtimeLog,
  setStatusLogs,
  appendStatusLog,
  clearStatusState,
  setGenerateError,
  setSiteUrl,
} = generateSlice.actions;

export default generateSlice.reducer;
