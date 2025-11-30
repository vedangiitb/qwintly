import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface genUi {
  width: string;
  chatVisible: boolean | null;
  editMode: boolean | null;
}

const initialState: genUi = {
  width: "100%",
  chatVisible: true,
  editMode: false,
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
  },
});

export const { setUiWidth, setUiChatvisible, setUiEditMode } =
  genUiSlice.actions;
export default genUiSlice.reducer;
