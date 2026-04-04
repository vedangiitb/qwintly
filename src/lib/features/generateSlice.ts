import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { GenerationStatusLog } from "@/features/generate/generate.types";

interface GenerateState {
  activeChatId: string | null;
  isGenerating: boolean;
  currentLog: GenerationStatusLog | null;
  statusLogs: GenerationStatusLog[];
  url: string | null;
  error: string | null;
}

const initialState: GenerateState = {
  activeChatId: null,
  isGenerating: false,
  currentLog: null,
  statusLogs: [],
  url: null,
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
    },
    setCurrentLog(state, action: PayloadAction<GenerationStatusLog | null>) {
      state.currentLog = action.payload;
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
  applyRealtimeLog,
  setStatusLogs,
  appendStatusLog,
  clearStatusState,
  setGenerateError,
  setSiteUrl,
} = generateSlice.actions;

export default generateSlice.reducer;
