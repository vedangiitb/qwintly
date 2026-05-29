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
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { useGenerate } from "../../hooks/useGenerate";
import WidthSetting from "./widthSetting";

export default function PreviewTopbar({
  updateDisplayUrl,
  displayUrl,
  currentRoute,
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
  currentRoute: string | null;
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
  const [isMobile, setIsMobile] = useState(false);

  const activeUrl = useMemo(() => {
    if (!displayUrl) return "";
    try {
      const origin = new URL(displayUrl).origin;
      const cleanRoute = currentRoute
        ? currentRoute.startsWith("/")
          ? currentRoute
          : `/${currentRoute}`
        : "/";
      return `${origin}${cleanRoute}`;
    } catch {
      return displayUrl;
    }
  }, [displayUrl, currentRoute]);

  const urlParts = useMemo(() => {
    if (!displayUrl) return { protocol: "https://", host: "" };
    try {
      const parsed = new URL(displayUrl);
      return {
        protocol: parsed.protocol + "//",
        host: parsed.host,
      };
    } catch {
      return {
        protocol: "https://",
        host: displayUrl.replace(/^(https?:\/\/)?(www\.)?/, "").split("/")[0],
      };
    }
  }, [displayUrl]);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 796);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const openInNewWindow = () => {
    if (activeUrl) window.open(activeUrl, "_blank");
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
      toast.error(
        err instanceof Error ? err.message : "Failed to deploy preview",
      );
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

  if (isMobile) {
    return (
      <div className="sticky top-0 z-10 mb-3 flex flex-col gap-2 rounded-xl border border-border/50 bg-background/70 px-2 py-2 backdrop-blur supports-backdrop-filter:bg-background/60">
        {/* Row 1: Title + Selector / Deploy */}
        <div className="flex items-center justify-between w-full gap-2">
          <h3 className="text-xs font-semibold tracking-wide text-foreground/80 pl-1">
            Preview
          </h3>

          <div className="flex items-center gap-2">
            {displayUrl && (canShowDeployed || canShowPreview) ? (
              <div className="flex items-center rounded-lg border border-border/60 bg-background/40 p-0.5">
                <button
                  aria-label="Show preview version"
                  onClick={() =>
                    previewUrl ? updateDisplayUrl(previewUrl) : null
                  }
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
                  !activeChatId?.trim() ||
                  isSessionRunning ||
                  isDeployingPreview
                }
                className={`${pillButtonBase} border border-border/60 bg-background/40 text-foreground/80 hover:bg-accent/60`}
                title="Deploy this preview"
              >
                {isDeployingPreview ? "Deploying…" : "Deploy"}
              </button>
            ) : null}
          </div>
        </div>

        {/* Row 2: Action Buttons */}
        {displayUrl && (
          <div className="flex items-center justify-between border-t border-border/40 pt-2 mt-0.5 w-full">
            <div className="flex items-center justify-between w-full gap-1">
              <button
                aria-label={editMode ? "Disable edit mode" : "Enable edit mode"}
                onClick={onToggleEditMode}
                disabled={!editingAvailable}
                className={`${pillButtonBase} gap-1 ${
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
                <span className="text-[10px] sm:text-[11px]">
                  {editMode ? "Editing" : "Edit"}
                </span>
              </button>

              <div className="flex items-center gap-1">
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
              </div>

              <button
                aria-label="Save edits"
                onClick={onSaveEdits}
                className={`${pillButtonBase} gap-1 bg-background/40 text-muted-foreground hover:bg-accent/60`}
                title="Save edits"
              >
                <Save className="h-3.5 w-3.5" />
                <span className="text-[10px] sm:text-[11px]">
                  Save{pendingEditsLabel ? ` (${pendingEditsLabel})` : ""}
                </span>
              </button>

              <div className="flex items-center gap-1">
                <button
                  aria-label="Copy link"
                  onClick={async () => {
                    if (!activeUrl?.trim()) return;
                    try {
                      await navigator.clipboard.writeText(activeUrl);
                      toast.success("Copied link");
                    } catch {
                      toast.error("Failed to copy link");
                    }
                  }}
                  disabled={!activeUrl?.trim()}
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
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="sticky top-0 z-10 mb-3 flex items-center justify-between gap-2 rounded-xl border border-border/50 bg-background/70 px-2 py-1.5 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="flex items-center gap-1.5">
        {!isMobile && (
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
        )}

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
            {!isMobile && (
              <WidthSetting width={width} setWidth={setDeviceMode} />
            )}

            {!isMobile && (
              <div className="mx-1 hidden h-5 w-px bg-border/70 sm:block" />
            )}

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
              <span className="hidden sm:inline">
                {editMode ? "Editing" : "Edit"}
              </span>
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
              <span className="hidden sm:inline">
                Save{pendingEditsLabel ? ` (${pendingEditsLabel})` : ""}
              </span>
            </button>

            <button
              aria-label="Copy link"
              onClick={async () => {
                if (!activeUrl?.trim()) return;
                try {
                  await navigator.clipboard.writeText(activeUrl);
                  toast.success("Copied link");
                } catch {
                  toast.error("Failed to copy link");
                }
              }}
              disabled={!activeUrl?.trim()}
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
