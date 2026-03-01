"use client";

import React, { createContext, useContext, useReducer } from "react";

type GenerateUiState = {
  chatVisible: boolean;
  editMode: boolean;
  layout: "pc" | "tab" | "phone";
};

type GenerateUiAction =
  | { type: "TOGGLE_CHAT" }
  | { type: "SET_EDIT_MODE"; payload: boolean }
  | { type: "SET_LAYOUT"; payload: "pc" | "tab" | "phone" };

const initialState: GenerateUiState = {
  chatVisible: true,
  editMode: false,
  layout: "pc",
};

function generateUiReducer(
  state: GenerateUiState,
  action: GenerateUiAction,
): GenerateUiState {
  switch (action.type) {
    case "TOGGLE_CHAT":
      return { ...state, chatVisible: !state.chatVisible };
    case "SET_EDIT_MODE":
      return { ...state, editMode: action.payload };
    case "SET_LAYOUT":
      return { ...state, layout: action.payload };
    default:
      return state;
  }
}

const GenerateUiContext = createContext<
  { state: GenerateUiState; dispatch: React.Dispatch<GenerateUiAction> } | undefined
>(undefined);

export function GenerateUiProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(generateUiReducer, initialState);

  return (
    <GenerateUiContext.Provider value={{ state, dispatch }}>
      {children}
    </GenerateUiContext.Provider>
  );
}

export function useGenerateUiContext() {
  const ctx = useContext(GenerateUiContext);
  if (!ctx) {
    throw new Error("useGenerateUiContext must be used within GenerateUiProvider");
  }
  return ctx;
}
