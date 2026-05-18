"use client";

import { useGenerateUi } from "@/features/generate/ui/hooks/useGenerateUi";
import {
  ExternalLink,
  PanelLeftClose,
  PanelLeftOpen,
  PencilLine,
  Redo2,
  Save,
  Undo2,
} from "lucide-react";
import { useGenerate } from "../../hooks/useGenerate";
import WidthSetting from "./widthSetting";

export default function PreviewTopbar({
  updateDisplayUrl,
  displayUrl,
  editMode,
  editingAvailable,
  onToggleEditMode,
  onSaveEdits,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  pendingEditsLabel,
}: {
  updateDisplayUrl: (url: string) => void;
  displayUrl: string;
  editMode: boolean;
  editingAvailable: boolean;
  onToggleEditMode: () => void;
  onSaveEdits: () => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  pendingEditsLabel: string | null;
}) {
  const { chatVisible, toggleChatVisible, width, setDeviceMode } =
    useGenerateUi();
  const { url, previewUrl } = useGenerate();

  const openInNewWindow = () => {
    if (displayUrl) window.open(displayUrl, "_blank");
  };

  const canShowDeployed = Boolean(url?.trim());
  const canShowPreview = Boolean(previewUrl?.trim());
  const showingDeployed = Boolean(url && displayUrl === url);
  const showingPreview = Boolean(previewUrl && displayUrl === previewUrl);

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

      {displayUrl && canShowDeployed && showingPreview ? (
        <button
          aria-label="Show deployed version"
          onClick={() => updateDisplayUrl(url!)}
          className="p-1.5 rounded-lg transition-all duration-150 ease-in-out hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring outline-none"
        >
          Show deployed version
        </button>
      ) : displayUrl && canShowPreview && showingDeployed ? (
        <button
          aria-label="Show preview version"
          onClick={() => updateDisplayUrl(previewUrl!)}
          className="p-1.5 rounded-lg transition-all duration-150 ease-in-out hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring outline-none"
        >
          Show preview version
        </button>
      ) : (
        <div />
      )}

      {displayUrl ? (
        <div className="flex items-center gap-1.5">
          <WidthSetting width={width} setWidth={setDeviceMode} />

          <button
            aria-label={editMode ? "Disable edit mode" : "Enable edit mode"}
            onClick={onToggleEditMode}
            disabled={!editingAvailable}
            className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg transition-all duration-150 ease-in-out focus-visible:ring-2 focus-visible:ring-ring outline-none ${
              editMode
                ? "bg-accent text-foreground"
                : "hover:bg-accent text-muted-foreground"
            } ${!editingAvailable ? "opacity-50 cursor-not-allowed" : ""}`}
            title={
              editingAvailable
                ? "Toggle edit mode"
                : "Editing unavailable for this preview (likely cross-origin)"
            }
          >
            <PencilLine className="w-4 h-4" />
            <span className="text-[12px] font-medium">
              {editMode ? "Editing" : "Edit"}
            </span>
          </button>

          <button
            aria-label="Undo"
            onClick={onUndo}
            disabled={!canUndo}
            className={`p-1.5 rounded-lg transition-all duration-150 ease-in-out hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring outline-none ${
              !canUndo ? "opacity-50 cursor-not-allowed" : ""
            }`}
            title="Undo"
          >
            <Undo2 className="w-4 h-4 text-muted-foreground" />
          </button>

          <button
            aria-label="Redo"
            onClick={onRedo}
            disabled={!canRedo}
            className={`p-1.5 rounded-lg transition-all duration-150 ease-in-out hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring outline-none ${
              !canRedo ? "opacity-50 cursor-not-allowed" : ""
            }`}
            title="Redo"
          >
            <Redo2 className="w-4 h-4 text-muted-foreground" />
          </button>

          <button
            aria-label="Save edits"
            onClick={onSaveEdits}
            className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg transition-all duration-150 ease-in-out hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring outline-none"
            title="Save edits"
          >
            <Save className="w-4 h-4 text-muted-foreground" />
            <span className="text-[12px] font-medium text-muted-foreground">
              Save{pendingEditsLabel ? ` (${pendingEditsLabel})` : ""}
            </span>
          </button>

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
