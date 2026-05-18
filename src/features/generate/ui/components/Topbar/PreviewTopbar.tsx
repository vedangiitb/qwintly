"use client";

import { useGenerateUi } from "@/features/generate/ui/hooks/useGenerateUi";
import { getGenIdFromUrl } from "@/features/generate/ui/hooks/usePreviewDomEdits";
import {
  Copy,
  ExternalLink,
  PanelLeftClose,
  PanelLeftOpen,
  PencilLine,
  Redo2,
  Save,
  Undo2,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
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
  const { url, previewUrl, activeChatId, deployApp, isSessionRunning } =
    useGenerate();
  const [isDeployingPreview, setIsDeployingPreview] = useState(false);

  const openInNewWindow = () => {
    if (displayUrl) window.open(displayUrl, "_blank");
  };

  const onDeployPreview = async () => {
    if (!activeChatId?.trim()) {
      toast.error("Missing active chat id");
      return;
    }

    if (isSessionRunning || isDeployingPreview) return;

    const genId = getGenIdFromUrl(previewUrl ?? displayUrl);
    if (!genId) {
      toast.error("Unable to resolve genId from preview URL");
      return;
    }

    setIsDeployingPreview(true);
    try {
      await deployApp(activeChatId, genId);
      toast.success("Deployment queued");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to deploy preview");
    } finally {
      setIsDeployingPreview(false);
    }
  };

  const canShowDeployed = Boolean(url?.trim());
  const canShowPreview = Boolean(previewUrl?.trim());
  const showingDeployed = Boolean(url && displayUrl === url);
  const showingPreview = Boolean(previewUrl && displayUrl === previewUrl);

  const iconButtonBase =
    "inline-flex items-center justify-center h-8 w-8 rounded-lg transition-colors hover:bg-accent/70 focus-visible:ring-2 focus-visible:ring-ring outline-none disabled:opacity-50 disabled:cursor-not-allowed";

  const pillButtonBase =
    "inline-flex items-center justify-center h-8 px-2.5 rounded-lg text-xs font-medium transition-colors focus-visible:ring-2 focus-visible:ring-ring outline-none disabled:opacity-50 disabled:cursor-not-allowed";

  return (
    <div className="sticky top-0 z-10 mb-3 flex items-center justify-between gap-2 rounded-xl border border-border/50 bg-background/70 px-2 py-1.5 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="flex items-center gap-1.5">
        <button
          aria-label={chatVisible ? "Close Chat Panel" : "Open Chat Panel"}
          onClick={toggleChatVisible}
          className={iconButtonBase}
          title={chatVisible ? "Close chat" : "Open chat"}
        >
          {chatVisible ? (
            <PanelLeftClose className="h-4.5 w-4.5 text-muted-foreground" />
          ) : (
            <PanelLeftOpen className="h-4.5 w-4.5 text-muted-foreground" />
          )}
        </button>

        <div className="ml-1 flex items-baseline gap-2">
          <h3 className="text-xs font-semibold tracking-wide text-foreground/80">
            Preview
          </h3>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {displayUrl && (canShowDeployed || canShowPreview) ? (
          <div className="flex items-center rounded-lg border border-border/60 bg-background/40 p-0.5">
            <button
              aria-label="Show preview version"
              onClick={() => (previewUrl ? updateDisplayUrl(previewUrl) : null)}
              disabled={!canShowPreview}
              className={`${pillButtonBase} ${
                showingPreview
                  ? "bg-accent text-foreground"
                  : "text-muted-foreground hover:bg-accent/50"
              }`}
              title={canShowPreview ? "Preview" : "No preview URL"}
            >
              Preview
            </button>
            <button
              aria-label="Show deployed version"
              onClick={() => (url ? updateDisplayUrl(url) : null)}
              disabled={!canShowDeployed}
              className={`${pillButtonBase} ${
                showingDeployed
                  ? "bg-accent text-foreground"
                  : "text-muted-foreground hover:bg-accent/50"
              }`}
              title={canShowDeployed ? "Deployed" : "No deployed URL"}
            >
              Deployed
            </button>
          </div>
        ) : null}

        {displayUrl && showingPreview ? (
          <button
            aria-label="Deploy this preview"
            onClick={() => void onDeployPreview()}
            disabled={
              !activeChatId?.trim() || isSessionRunning || isDeployingPreview
            }
            className={`${pillButtonBase} border border-border/60 bg-background/40 text-foreground/80 hover:bg-accent/60`}
            title="Deploy this preview"
          >
            {isDeployingPreview ? "Deploying…" : "Deploy"}
          </button>
        ) : null}
      </div>

      <div className="flex items-center gap-1.5">
        {displayUrl ? (
          <>
            <WidthSetting width={width} setWidth={setDeviceMode} />

            <div className="mx-1 hidden h-5 w-px bg-border/70 sm:block" />

            <button
              aria-label={editMode ? "Disable edit mode" : "Enable edit mode"}
              onClick={onToggleEditMode}
              disabled={!editingAvailable}
              className={`${pillButtonBase} gap-1.5 ${
                editMode
                  ? "bg-accent text-foreground"
                  : "bg-background/40 text-muted-foreground hover:bg-accent/60"
              }`}
              title={
                editingAvailable
                  ? "Toggle edit mode"
                  : "Editing unavailable for this preview (likely cross-origin)"
              }
            >
              <PencilLine className="h-3.5 w-3.5" />
              <span>{editMode ? "Editing" : "Edit"}</span>
            </button>

            <button
              aria-label="Undo"
              onClick={onUndo}
              disabled={!canUndo}
              className={iconButtonBase}
              title="Undo"
            >
              <Undo2 className="h-4 w-4 text-muted-foreground" />
            </button>

            <button
              aria-label="Redo"
              onClick={onRedo}
              disabled={!canRedo}
              className={iconButtonBase}
              title="Redo"
            >
              <Redo2 className="h-4 w-4 text-muted-foreground" />
            </button>

            <button
              aria-label="Save edits"
              onClick={onSaveEdits}
              className={`${pillButtonBase} gap-1.5 bg-background/40 text-muted-foreground hover:bg-accent/60`}
              title="Save edits"
            >
              <Save className="h-3.5 w-3.5" />
              <span>
                Save{pendingEditsLabel ? ` (${pendingEditsLabel})` : ""}
              </span>
            </button>

            <button
              aria-label="Copy link"
              onClick={async () => {
                if (!displayUrl?.trim()) return;
                try {
                  await navigator.clipboard.writeText(displayUrl);
                  toast.success("Copied link");
                } catch {
                  toast.error("Failed to copy link");
                }
              }}
              disabled={!displayUrl?.trim()}
              className={iconButtonBase}
              title="Copy link"
            >
              <Copy className="h-4 w-4 text-muted-foreground" />
            </button>

            <button
              aria-label="Open in new window"
              onClick={openInNewWindow}
              className={iconButtonBase}
              title="Open in new window"
            >
              <ExternalLink className="h-4.5 w-4.5 text-muted-foreground" />
            </button>
          </>
        ) : (
          <div />
        )}
      </div>
    </div>
  );
}
