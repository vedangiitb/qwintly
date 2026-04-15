"use client";

import { useGenerateUi } from "@/features/generate/ui/hooks/useGenerateUi";
import { ExternalLink, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { useGenerate } from "../../hooks/useGenerate";
import EditMode from "./EditMode";
import WidthSetting from "./widthSetting";

export default function PreviewTopbar() {
  const {
    chatVisible,
    toggleChatVisible,
    width,
    setDeviceMode,
    editMode,
    toggleEditMode,
  } = useGenerateUi();
  const { url } = useGenerate();

  const openInNewWindow = () => {
    if (url) window.open(url, "_blank");
  };

  return (
    <div className="flex items-center justify-between px-4 py-2.5 mb-3 select-none bg-background/50 border border-border/40 backdrop-blur-sm rounded-xl shadow-sm">
      <button
        aria-label={chatVisible ? "Close Chat Panel" : "Open Chat Panel"}
        onClick={toggleChatVisible}
        className="p-1.5 rounded-lg transition-all duration-150 ease-in-out hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring outline-none"
      >
        {chatVisible ? (
          <PanelLeftClose className="w-5 h-5 text-muted-foreground" />
        ) : (
          <PanelLeftOpen className="w-5 h-5 text-muted-foreground" />
        )}
      </button>

      <h3 className="text-[13px] font-medium tracking-widest uppercase text-muted-foreground/80 select-text">Preview</h3>

      {url ? (
        <div className="flex items-center gap-3">
          <EditMode editMode={editMode} toggleEditMode={toggleEditMode} />
          <WidthSetting width={width} setWidth={setDeviceMode} />
          <button
            aria-label="Open in new window"
            onClick={openInNewWindow}
            className="p-1.5 rounded-lg transition-all duration-150 ease-in-out hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring outline-none"
          >
            <ExternalLink className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>
      ) : (
        <div />
      )}

    </div>
  );
}
