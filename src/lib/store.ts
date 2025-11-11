import { configureStore } from "@reduxjs/toolkit";
import authReducer from "@/lib/features/authSlice";
import orgReducer from "@/lib/features/orgSlice";
import promptReducer from "@/lib/features/promptSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    org: orgReducer,
    prompt: promptReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
