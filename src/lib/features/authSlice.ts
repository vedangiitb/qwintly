import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export interface User {
  id: string;
  email: string | null;
  displayName: string | null;
  emailVerified: boolean;
}

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  loading: true,
  error: null,
};

// -----------------------------------
// Listens for Supabase auth changes
// -----------------------------------
export const listenToAuthChanges = createAsyncThunk(
  "auth/listenToAuthChanges",
  async (_, { dispatch }) => {
    return new Promise<void>((resolve) => {
      supabase.auth.getUser().then(({ data }) => {
        if (data?.user) {
          dispatch(
            setUser({
              id: data.user.id,
              email: data.user.email || null,
              displayName: data.user.user_metadata?.userName || null,
              emailVerified: !!data.user.email_confirmed_at,
            })
          );
        } else {
          dispatch(setUser(null));
        }
        dispatch(setLoading(false));
      });

      supabase.auth.onAuthStateChange((event, session) => {
        if (session?.user) {
          dispatch(
            setUser({
              id: session.user.id,
              email: session.user.email || null,
              displayName: session.user.user_metadata?.userName || null,
              emailVerified: !!session.user.email_confirmed_at,
            })
          );
        } else {
          dispatch(setUser(null));
        }
      });

      resolve();
    });
  }
);

// -----------------------------------
// Logout
// -----------------------------------
export const logoutUser = createAsyncThunk("auth/logoutUser", async () => {
  await supabase.auth.signOut();
  return null;
});

// -----------------------------------
// Slice
// -----------------------------------
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User | null>) => {
      state.user = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
      })
      .addCase(listenToAuthChanges.rejected, (state, action) => {
        state.error = action.error.message || "Auth listener failed";
      });
  },
});

export const { setUser, setLoading, setError } = authSlice.actions;
export default authSlice.reducer;
