import { configureStore } from "@reduxjs/toolkit";
import orgReducer from "@/lib/features/orgSlice";

export const store = configureStore({
  reducer: {
    org: orgReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
