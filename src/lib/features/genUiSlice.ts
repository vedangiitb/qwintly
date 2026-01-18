import { Stage } from "@/types/chat";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface GenerationState {
  // If site is being generated
  isGenerating: boolean;
  // The status of the site being generated (sent from backend via ws)
  status: string | null;
  // Boolean value describing if the site has been generated
  generated: boolean;
  // Site url
  url: string | null;
  // Project stage
  stage: Stage;
}

const initialState: GenerationState = {
  isGenerating: false,
  status: null,
  generated: false,
  url: null,
  stage: "init",
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
    updateStage(state, action: PayloadAction<Stage>) {
      state.stage = action.payload;
    },
  },
});

export const {
  generationStarted,
  generationStatusUpdated,
  generationFinished,
  generationUrl,
  resetStatus,
  updateStage,
} = generationSlice.actions;

export default generationSlice.reducer;
