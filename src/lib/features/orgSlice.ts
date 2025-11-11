import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface Org {
  org_id: string;
  org_name: string;
  created_at: string;
}

interface OrgState {
  list: Org[];
}

const initialState: OrgState = {
  list: [],
};

const orgSlice = createSlice({
  name: "org",
  initialState,
  reducers: {
    setOrganizations: (state, action: PayloadAction<Org[]>) => {
      state.list = action.payload;
    },
    addOrganization: (state, action: PayloadAction<Org>) => {
      state.list.push(action.payload);
    },
  },
});

export const { setOrganizations, addOrganization } = orgSlice.actions;
export default orgSlice.reducer;
