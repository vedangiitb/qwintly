"use client";
import { useCallback, useMemo } from "react";
import { useUi } from "../uiContext";

type DeviceMode = "phone" | "tab" | "pc";

export const useChatUi = () => {
  const { state, dispatch } = useUi();
  const { chatVisible, editMode, layout } = state;

  const width = useMemo(() => {
    return layout == "pc" ? "100%" : layout == "tab" ? "600px" : "375px";
  }, [layout]);

  const toggleChatVisible = useCallback(() => {
    dispatch({ type: "TOGGLE_CHAT" });
  }, [dispatch]);

  const setDeviceMode = useCallback(
    (mode: DeviceMode) => {
      dispatch({ type: "SET_LAYOUT", payload: mode });
    },
    [dispatch]
  );

  const toggleEditMode = useCallback(() => {
    const iframe = document.getElementById(
      "preview-frame"
    ) as HTMLIFrameElement | null;

    iframe?.contentWindow?.postMessage(
      {
        type: "editMode",
        value: !editMode,
      },
      window.location.origin
    );

    dispatch({ type: "SET_EDIT_MODE", payload: !editMode });
  }, [dispatch, editMode]);

  return {
    chatVisible,
    toggleChatVisible,
    width,
    setDeviceMode,
    editMode,
    toggleEditMode,
  } as const;
};
