import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";

// Example fetch — replace with your actual API/Supabase call
export const fetchOrganizations = createAsyncThunk(
  "org/fetchOrganizations",
  async () => {
    const res = await fetch("/api/orgs"); // your API endpoint
    if (!res.ok) throw new Error("Failed to fetch organizations");
    return res.json(); // should return an array of orgs
  }
);

interface Org {
  id: string;
  name: string;
  description?: string;
}

interface OrgState {
  list: Org[];
  loading: boolean;
  error: string | null;
}

const initialState: OrgState = {
  list: [],
  loading: false,
  error: null,
};

const orgSlice = createSlice({
  name: "org",
  initialState,
  reducers: {
    addOrganization: (state, action: PayloadAction<Org>) => {
      state.list.push(action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchOrganizations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrganizations.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(fetchOrganizations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Something went wrong";
      });
  },
});

export const { addOrganization } = orgSlice.actions;
export default orgSlice.reducer;
