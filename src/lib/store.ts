import { configureStore } from "@reduxjs/toolkit";
import orgReducer from "@/lib/features/orgSlice";
import promptReducer from "@/lib/features/promptSlice";

export const store = configureStore({
  reducer: {
    org: orgReducer,
    prompt: promptReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
