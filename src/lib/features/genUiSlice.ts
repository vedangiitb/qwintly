import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface genUi {
  width: string;
  chatVisible: boolean | null;
  editMode: boolean | null;
  isGenerating:boolean;
  generateStatus: string | null;
}

const initialState: genUi = {
  width: "100%",
  chatVisible: true,
  editMode: false,
  isGenerating: false,
  generateStatus: null
};

const genUiSlice = createSlice({
  name: "newProject",
  initialState,
  reducers: {
    setUiWidth: (state, action: PayloadAction<string>) => {
      state.width = action.payload;
    },
    setUiChatvisible: (state, action: PayloadAction<boolean | null>) => {
      state.chatVisible = action.payload;
    },
    setUiEditMode: (state, action: PayloadAction<boolean | null>) => {
      state.editMode = action.payload;
    },
    setIsGenerating: (state, action: PayloadAction<boolean>) => {
      state.isGenerating = action.payload;
    },
    setGenerateStatus: (state, action: PayloadAction<string | null>) => {
      state.generateStatus = action.payload;
    },
  },
});

export const { setUiWidth, setUiChatvisible, setUiEditMode, setIsGenerating, setGenerateStatus } =
  genUiSlice.actions;
export default genUiSlice.reducer;
