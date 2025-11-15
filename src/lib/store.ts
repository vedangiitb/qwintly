import authReducer from "@/lib/features/authSlice";
import newProjectReducer from "@/lib/features/newProjectSlice";
import orgReducer from "@/lib/features/orgSlice";
import promptReducer from "@/lib/features/promptSlice";
import { configureStore } from "@reduxjs/toolkit";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    org: orgReducer,
    prompt: promptReducer,
    newProject: newProjectReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
