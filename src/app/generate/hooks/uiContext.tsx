"use client";
import React, { createContext, useContext, useReducer } from "react";

type UiState = {
  chatVisible: boolean;
  editMode: boolean;
  layout: "pc" | "tab" | "phone";
};

type UiAction =
  | { type: "TOGGLE_CHAT" }
  | { type: "SET_EDIT_MODE"; payload: boolean }
  | { type: "SET_LAYOUT"; payload: "pc" | "tab" | "phone" };

const initialState: UiState = {
  chatVisible: true,
  editMode: false,
  layout: "pc",
};

function uiReducer(state: UiState, action: UiAction): UiState {
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

const UiContext = createContext<
  { state: UiState; dispatch: React.Dispatch<UiAction> } | undefined
>(undefined);

export function UiProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(uiReducer, initialState);

  return (
    <UiContext.Provider value={{ state, dispatch }}>
      {children}
    </UiContext.Provider>
  );
}

export function useUi() {
  const ctx = useContext(UiContext);
  if (!ctx) {
    throw new Error("useUi must be used within UiProvider");
  }
  return ctx;
}
