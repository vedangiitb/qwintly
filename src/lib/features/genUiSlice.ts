import { Stage } from "@/types/chat";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface GenerationState {
  isGenerating: boolean;
  status: string | null;
  generated: boolean;
  url: string | null;
  stage: Stage;
  questionsList: Questions;
  answersList: string[] | null;
  collectedInfo: CollectedInfo;
}

const collectInfoInitialState: CollectedInfo = {
  name: "",
  description: "",
  category: "",
  targetUsers: "",
  otherInfo: [],
};

const initialState: GenerationState = {
  isGenerating: false,
  status: null,
  generated: false,
  url: null,
  stage: "init",
  questionsList: [],
  collectedInfo: collectInfoInitialState,
  answersList: [],
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
    updateQuestionsList(state, action: PayloadAction<Questions>) {
      state.questionsList = action.payload;
    },
    updateCollectedInfo(state, action: PayloadAction<CollectedInfo>) {
      state.collectedInfo = action.payload;
    },
    updateAnswersList(state, action: PayloadAction<string[]>) {
      state.answersList = action.payload;
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
  updateQuestionsList,
  updateAnswersList,
} = generationSlice.actions;

export default generationSlice.reducer;
