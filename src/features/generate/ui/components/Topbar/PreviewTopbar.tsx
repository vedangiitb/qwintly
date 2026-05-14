"use client";

import { useGenerateUi } from "@/features/generate/ui/hooks/useGenerateUi";
import { ExternalLink, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { useGenerate } from "../../hooks/useGenerate";
import WidthSetting from "./widthSetting";

export default function PreviewTopbar({
  updateDisplayUrl,
  displayUrl,
}: {
  updateDisplayUrl: (url: string) => void;
  displayUrl: string;
}) {
  const { chatVisible, toggleChatVisible, width, setDeviceMode } =
    useGenerateUi();
  const { url } = useGenerate();

  const openInNewWindow = () => {
    if (displayUrl) window.open(displayUrl, "_blank");
  };

  return (
    <div className="flex items-center justify-between px-2 py-1 mb-3 select-none bg-background/50 border border-border/40 backdrop-blur-sm rounded-xl shadow-sm">
      <button
        aria-label={chatVisible ? "Close Chat Panel" : "Open Chat Panel"}
        onClick={toggleChatVisible}
        className="p-1.5 rounded-lg transition-all duration-150 ease-in-out hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring outline-none"
      >
        {chatVisible ? (
          <PanelLeftClose className="w-5 h-5 text-muted-foreground hover:cursor-pointer" />
        ) : (
          <PanelLeftOpen className="w-5 h-5 text-muted-foreground hover:cursor-pointer" />
        )}
      </button>

      <h3 className="text-[13px] font-medium tracking-widest uppercase text-muted-foreground/80 select-text">
        Preview
      </h3>

      {url && url != displayUrl ? (
        <button
          aria-label="Open in new window"
          onClick={() => updateDisplayUrl(url)}
          className="p-1.5 rounded-lg transition-all duration-150 ease-in-out hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring outline-none"
        >
          Show deployed version
        </button>
      ) : (
        <div />
      )}

      {displayUrl ? (
        <div className="flex items-center gap-3">
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
