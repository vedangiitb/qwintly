import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface GenerationState {
  isGenerating: boolean;
  status: string | null;
  generated: boolean;
  url: string | null;
}

const initialState: GenerationState = {
  isGenerating: false,
  status: null,
  generated: false,
  url: null,
};

const generationSlice = createSlice({
  name: "generation",
  initialState,
  reducers: {
    generationStarted(state) {
      state.isGenerating = true;
      state.status = "Starting";
    },
    generationStatusUpdated(state, action: PayloadAction<string>) {
      state.status = action.payload;
    },
    generationFinished(state) {
      state.isGenerating = false;
      state.status = null;
    },
    generationUrl(state, action: PayloadAction<string>) {
      if (action.payload) {
        state.generated = true;
        state.url = action.payload;
      }
    },
    resetStatus(state) {
      state.isGenerating = false;
      state.status = null;
      state.generated = false;
      state.url = null;
    },
  },
});

export const {
  generationStarted,
  generationStatusUpdated,
  generationFinished,
  generationUrl,
  resetStatus
} = generationSlice.actions;

export default generationSlice.reducer;
