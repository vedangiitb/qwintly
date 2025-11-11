import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface PromptState {
  prompt: string;
}

const initialState: PromptState = {
  prompt: "",
};

const promptSlice = createSlice({
  name: "prompt",
  initialState,
  reducers: {
    setChatPrompt: (state, action: PayloadAction<string>) => {
      state.prompt = action.payload;
    },
    clearPrompt: (state) => {
      state.prompt = "";
    },
  },
});

export const { setChatPrompt, clearPrompt } = promptSlice.actions;
export default promptSlice.reducer;
