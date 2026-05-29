"use client";

import { useGenerateUi } from "@/features/generate/ui/hooks/useGenerateUi";
import { useEffect, useRef, useState } from "react";
import { useGenerate } from "../hooks/useGenerate";
import { usePreviewDomEdits } from "../hooks/usePreviewDomEdits";
import PreviewFrame from "./PreviewFrame";
import PreviewTopbar from "./Topbar/PreviewTopbar";

export default function PreviewPanel() {
  const { url, previewUrl, sessionId, activeChatId } = useGenerate();
  const { width } = useGenerateUi();

  const [displayUrl, setDisplayUrl] = useState(url || previewUrl);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 796);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  const updateDisplayUrl = (dispUrl: string) => {
    if (!dispUrl || dispUrl === displayUrl) return;
    setDisplayUrl(dispUrl);
  };

  useEffect(() => {
    updateDisplayUrl(previewUrl);
  }, [previewUrl]);

  const {
    editMode,
    editingAvailable,
    appliedOps,
    canUndo,
    canRedo,
    pendingEditsLabel,
    currentRoute,
    onIframeLoad,
    onToggleEditMode,
    onUndo,
    onRedo,
    onSaveEdits,
  } = usePreviewDomEdits({
    displayUrl,
    iframeRef,
    genId: sessionId ?? null,
    chatId: activeChatId ?? null,
  });

  return (
    <div className="h-full flex flex-col p-2">
      <PreviewTopbar
        updateDisplayUrl={updateDisplayUrl}
        displayUrl={displayUrl}
        currentRoute={currentRoute}
        editMode={editMode}
        editingAvailable={editingAvailable}
        onToggleEditMode={onToggleEditMode}
        onSaveEdits={onSaveEdits}
        onUndo={onUndo}
        onRedo={onRedo}
        canUndo={canUndo}
        canRedo={canRedo}
        pendingEditsLabel={pendingEditsLabel}
      />

      {appliedOps.length ? (
        <div className="mb-2 px-2 py-1 text-[12px] text-muted-foreground border border-border/40 rounded-lg bg-background/40 backdrop-blur-sm">
          Pending edits:{" "}
          <span className="text-foreground/80 font-medium">{appliedOps.length}</span>
          {currentRoute ? (
            <span className="ml-2 text-muted-foreground/70">
              • Route: <span className="font-medium text-foreground/70">{currentRoute}</span>
            </span>
          ) : null}
        </div>
      ) : null}

      {displayUrl ? (
        <iframe
          id="preview-frame"
          key={displayUrl}
          src={displayUrl}
          ref={iframeRef}
          title="Preview of the generated website"
          onLoad={onIframeLoad}
          className={isMobile ? "w-full flex-1 min-h-125" : ""}
          style={isMobile ? {
            margin: "auto",
            height: "calc(100vh - 180px)",
            border: "1px solid var(--border)",
            borderRadius: "8px",
            boxShadow:
              "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
          } : {
            margin: "auto",
            height: "800px",
            width: width,
            border: "1px solid var(--border)",
            borderRadius: "8px",
            boxShadow:
              "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
          }}
        />
      ) : (
        <PreviewFrame />
      )}
    </div>
  );
}
