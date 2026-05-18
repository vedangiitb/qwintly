"use client";

import { useGenerateUi } from "@/features/generate/ui/hooks/useGenerateUi";
import { useEffect, useMemo, useRef, useState } from "react";
import { useGenerate } from "../hooks/useGenerate";
import PreviewFrame from "./PreviewFrame";
import PreviewTopbar from "./Topbar/PreviewTopbar";
import { toast } from "sonner";

type PreviewDomOp =
  | {
      kind: "text";
      id: string;
      oldText: string;
      newText: string;
    }
  | {
      kind: "delete";
      id: string;
      parentId: string;
      nextSiblingId: string | null;
      oldOuterHTML: string;
    };

const IFRAME_EDITOR_SOURCE = "qwintly-preview-editor";

// Editor script now runs inside the preview site (cross-origin safe) and talks back via postMessage.

export default function PreviewPanel() {
  const { url, previewUrl, sessionId, activeChatId } = useGenerate();
  const { width } = useGenerateUi();

  const [displayUrl, setDisplayUrl] = useState(url || previewUrl);
  const [editMode, setEditMode] = useState(false);
  const [editingAvailable, setEditingAvailable] = useState(false);
  const [appliedOps, setAppliedOps] = useState<PreviewDomOp[]>([]);
  const [undoneOps, setUndoneOps] = useState<PreviewDomOp[]>([]);

  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const readyTimeoutRef = useRef<number | null>(null);

  const iframeOrigin = useMemo(() => {
    try {
      return displayUrl ? new URL(displayUrl).origin : null;
    } catch {
      return null;
    }
  }, [displayUrl]);

  const canUndo = appliedOps.length > 0;
  const canRedo = undoneOps.length > 0;

  const pendingOpsLabel = useMemo(() => {
    if (!appliedOps.length) return null;
    return `${appliedOps.length} change${appliedOps.length === 1 ? "" : "s"}`;
  }, [appliedOps.length]);

  const updateDisplayUrl = (dispUrl: string) => {
    if (!dispUrl || dispUrl === displayUrl) return;
    setDisplayUrl(dispUrl);
  };

  useEffect(() => {
    updateDisplayUrl(previewUrl);
  }, [previewUrl]);

  const postToIframe = (payload: Record<string, unknown>) => {
    const win = iframeRef.current?.contentWindow;
    if (!win) return;
    win.postMessage(
      { source: IFRAME_EDITOR_SOURCE, ...payload },
      iframeOrigin ?? "*",
    );
  };

  useEffect(() => {
    return () => {
      if (readyTimeoutRef.current) {
        window.clearTimeout(readyTimeoutRef.current);
        readyTimeoutRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      const iframeWin = iframeRef.current?.contentWindow;
      if (!iframeWin || event.source !== iframeWin) return;
      if (iframeOrigin && event.origin !== iframeOrigin) return;
      const data = event.data as any;
      if (!data || data.source !== IFRAME_EDITOR_SOURCE) return;

      if (data.type === "READY") {
        setEditingAvailable(true);
        if (readyTimeoutRef.current) {
          window.clearTimeout(readyTimeoutRef.current);
          readyTimeoutRef.current = null;
        }
        postToIframe({ type: "SET_EDIT_MODE", enabled: editMode });
        return;
      }

      if (data.type === "OP_CONFIRMED" && data.op) {
        const op = data.op as PreviewDomOp;
        setAppliedOps((prev) => [...prev, op]);
        setUndoneOps([]);
        return;
      }
    };

    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [editMode, iframeOrigin]);

  const onIframeLoad = () => {
    // Cross-origin preview: wait for the preview site to load the editor script and send READY.
    setEditingAvailable(false);

    if (readyTimeoutRef.current) window.clearTimeout(readyTimeoutRef.current);
    readyTimeoutRef.current = window.setTimeout(() => {
      setEditingAvailable(false);
    }, 1500);

    postToIframe({ type: "PING" });
  };

  const toggleEditMode = () => {
    if (!editingAvailable) return;
    setEditMode((prev) => {
      const next = !prev;
      postToIframe({ type: "SET_EDIT_MODE", enabled: next });
      return next;
    });
  };

  const undo = () => {
    if (!appliedOps.length) return;
    const op = appliedOps[appliedOps.length - 1];
    setAppliedOps((prev) => prev.slice(0, -1));
    setUndoneOps((prev) => [...prev, op]);
    postToIframe({ type: "REVERT_OP", op });
  };

  const redo = () => {
    if (!undoneOps.length) return;
    const op = undoneOps[undoneOps.length - 1];
    setUndoneOps((prev) => prev.slice(0, -1));
    setAppliedOps((prev) => [...prev, op]);
    postToIframe({ type: "APPLY_OP", op });
  };

  const saveEdits = async () => {
    if (!appliedOps.length) {
      toast("No changes to save");
      return;
    }

    try {
      const res = await fetch("/api/generate/save-edits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          route: displayUrl,
          genId: sessionId,
          chatId: activeChatId,
          operations: appliedOps,
        }),
      });

      if (!res.ok) throw new Error(await res.text());
      toast.success("Saved edits");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save edits");
    }
  };

  return (
    <div className="h-full flex flex-col p-2">
      <PreviewTopbar
        updateDisplayUrl={updateDisplayUrl}
        displayUrl={displayUrl}
        editMode={editMode}
        editingAvailable={editingAvailable}
        onToggleEditMode={toggleEditMode}
        onSaveEdits={saveEdits}
        onUndo={undo}
        onRedo={redo}
        canUndo={canUndo}
        canRedo={canRedo}
        pendingEditsLabel={pendingOpsLabel}
      />

      {appliedOps.length ? (
        <div className="mb-2 px-2 py-1 text-[12px] text-muted-foreground border border-border/40 rounded-lg bg-background/40 backdrop-blur-sm">
          Pending edits:{" "}
          <span className="text-foreground/80 font-medium">{appliedOps.length}</span>
        </div>
      ) : null}

      {displayUrl ? (
        <iframe
          id="preview-frame"
          key={displayUrl}
          src={displayUrl}
          ref={iframeRef}
          onLoad={onIframeLoad}
          style={{
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
