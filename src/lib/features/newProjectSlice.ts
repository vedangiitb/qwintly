import {
  projectConfig,
  projectDetails,
  StepType,
} from "@/app/project/hooks/useNewProject";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

const initialState: projectDetails = {
  name: null,
  description: null,
  category: null,
  template: null,
  config: null,
  step: "init",
};

const newProjectSlice = createSlice({
  name: "newProject",
  initialState,
  reducers: {
    setProjectStep: (state, action: PayloadAction<StepType>) => {
      state.step = action.payload;
    },
    setProjectName: (state, action: PayloadAction<string | null>) => {
      state.name = action.payload;
    },
    setProjectDescription: (state, action: PayloadAction<string | null>) => {
      state.description = action.payload;
    },
    setProjectCategory: (state, action: PayloadAction<string | null>) => {
      state.category = action.payload;
    },
    setProjectTemplate: (state, action: PayloadAction<string | null>) => {
      state.template = action.payload;
    },
    setProjectConfig: (state, action: PayloadAction<projectConfig | null>) => {
      state.config = action.payload;
    },
  },
});

export const {
  setProjectStep,
  setProjectName,
  setProjectDescription,
  setProjectCategory,
  setProjectTemplate,
  setProjectConfig,
} = newProjectSlice.actions;
export default newProjectSlice.reducer;
