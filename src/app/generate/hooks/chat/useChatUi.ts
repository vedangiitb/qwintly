"use client";
import { setUiChatvisible, setUiWidth } from "@/lib/features/genUiSlice";
import { AppDispatch, RootState } from "@/lib/store";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";

export const useChatUi = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [editMode, setEditMode] = useState(false);
  const chatVisible = useSelector(
    (state: RootState) => state.genUi.chatVisible
  );
  const width = useSelector((state: RootState) => state.genUi.width);

  const setChatVisible = () => {
    dispatch(setUiChatvisible(!chatVisible));
  };

  const setWidth = (mode: "phone" | "tablet" | "pc") => {
    if (mode == "phone") {
      dispatch(setUiWidth("375px"));
    } else if (mode == "tablet") {
      dispatch(setUiWidth("600px"));
    } else dispatch(setUiWidth("100%"));
  };

  const toggleEditMode = () => {
    if (!setEditMode) return;
    const iframe = document.getElementById(
      "preview-frame"
    ) as HTMLIFrameElement;
    iframe?.contentWindow?.postMessage(
      {
        type: "editMode",
        value: !editMode,
      },
      window.location.origin
    );
    setEditMode(!editMode);
  };

  return {
    chatVisible,
    setChatVisible,
    width,
    setWidth,
    editMode,
    toggleEditMode,
  } as const;
};
