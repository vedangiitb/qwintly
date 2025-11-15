import { projectDetails } from "@/app/project/hooks/useNewProject";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

const initialState: projectDetails = {
  name: null,
  category: null,
  template: null,
};

const newProjectSlice = createSlice({
  name: "newProject",
  initialState,
  reducers: {
    setProjectCategory: (state, action: PayloadAction<string | null>) => {
      state.category = action.payload;
    },
    setProjectTemplate: (state, action: PayloadAction<string | null>) => {
      state.template = action.payload;
    },
  },
});

export const { setProjectCategory, setProjectTemplate } = newProjectSlice.actions;
export default newProjectSlice.reducer;
