import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";
import { auth } from "@/lib/firebaseConfig";
import { onAuthStateChanged, signOut, User as FirebaseUser } from "firebase/auth";

export interface User {
  uid: string;
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

export const listenToAuthChanges = createAsyncThunk(
  "auth/listenToAuthChanges",
  async (_, { dispatch, rejectWithValue }) => {
    return new Promise<void>((resolve) => {
      onAuthStateChanged(auth, (firebaseUser) => {
        if (firebaseUser) {
          const user: User = {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName,
            emailVerified: firebaseUser.emailVerified,
          };
          dispatch(setUser(user));
        } else {
          dispatch(setUser(null));
        }
        dispatch(setLoading(false));
        resolve();
      });
    });
  }
);

export const logoutUser = createAsyncThunk("auth/logoutUser", async () => {
  await signOut(auth);
  return null;
});

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
