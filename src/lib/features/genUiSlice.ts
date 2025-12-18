import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface GenerationState {
  isGenerating: boolean;
  status: string | null;
}

const initialState: GenerationState = {
  isGenerating: false,
  status: null,
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
  },
});

export const {
  generationStarted,
  generationStatusUpdated,
  generationFinished,
} = generationSlice.actions;

export default generationSlice.reducer;
