import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { GenerationStatusLog } from "@/features/generate/generate.types";

interface GenerateState {
  activeChatId: string | null;
  isGenerating: boolean;
  currentStatus: string | null;
  statusLogs: GenerationStatusLog[];
  url: string | null;
  error: string | null;
}

const initialState: GenerateState = {
  activeChatId: null,
  isGenerating: false,
  currentStatus: null,
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
    setCurrentStatus(state, action: PayloadAction<string | null>) {
      state.currentStatus = action.payload;
    },
    setStatusLogs(state, action: PayloadAction<GenerationStatusLog[]>) {
      state.statusLogs = action.payload;
    },
    appendStatusLog(state, action: PayloadAction<GenerationStatusLog>) {
      state.statusLogs.push(action.payload);
    },
    clearStatusState(state) {
      state.currentStatus = null;
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
  setCurrentStatus,
  setStatusLogs,
  appendStatusLog,
  clearStatusState,
  setGenerateError,
  setSiteUrl,
} = generateSlice.actions;

export default generateSlice.reducer;
