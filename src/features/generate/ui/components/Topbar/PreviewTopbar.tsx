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
    <div className="topbar flex items-center justify-between px-3 py-2 mb-3 select-none">
      <button
        aria-label={chatVisible ? "Close Chat Panel" : "Open Chat Panel"}
        onClick={toggleChatVisible}
        className="topbar-icon"
      >
        {chatVisible ? (
          <PanelLeftClose className="w-5 h-5 text-muted-foreground" />
        ) : (
          <PanelLeftOpen className="w-5 h-5 text-muted-foreground" />
        )}
      </button>

      <h3 className="title select-text">Preview</h3>

      {url ? (
        <div className="flex items-center gap-3">
          <EditMode editMode={editMode} toggleEditMode={toggleEditMode} />
          <WidthSetting width={width} setWidth={setDeviceMode} />
          <button
            aria-label="Open in new window"
            onClick={openInNewWindow}
            className="topbar-icon"
          >
            <ExternalLink className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>
      ) : (
        <div />
      )}

      <style jsx>{`
        .topbar {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 10px;
        }

        .topbar-icon {
          padding: 6px;
          border-radius: 8px;
          transition:
            background 160ms ease,
            color 160ms ease;
          outline: none;
        }

        .topbar-icon:hover {
          background: rgba(255, 255, 255, 0.06);
        }

        .topbar-icon:focus-visible {
          box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.18);
        }

        .title {
          font-size: 13px;
          font-weight: 500;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: rgba(255, 255, 255, 0.7);
        }
      `}</style>
    </div>
  );
}
