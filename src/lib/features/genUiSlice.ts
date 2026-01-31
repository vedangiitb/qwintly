import { PlanOutput } from "@/app/generate/components/chat/planPreview";
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
  // plan
  plans: PlanOutput[] | null;
  // Currently generated plan
  currPlan: PlanOutput | null;
}

const initialState: GenerationState = {
  isGenerating: false,
  status: null,
  generated: false,
  url: null,
  stage: "init",
  plans: null,
  currPlan: null,
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
    updatePlans(state, action: PayloadAction<PlanOutput[]>) {
      state.plans = action.payload;
    },
    updateCurrPlan(state, action: PayloadAction<PlanOutput>) {
      state.currPlan = action.payload;
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
  updatePlans,
  updateCurrPlan,
} = generationSlice.actions;

export default generationSlice.reducer;
