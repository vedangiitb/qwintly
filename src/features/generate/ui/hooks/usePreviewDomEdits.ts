"use client";

import { generateClient } from "@/features/generate/ui/api/generate.client";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

export type PreviewDomOp =
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

const tryGetOrigin = (url: string | null | undefined) => {
  if (!url) return null;
  try {
    return new URL(url).origin;
  } catch {
    return null;
  }
};

export function usePreviewDomEdits(params: {
  displayUrl: string;
  iframeRef: React.RefObject<HTMLIFrameElement | null>;
  genId: string | null;
  chatId: string | null;
}) {
  const { displayUrl, iframeRef, genId, chatId } = params;

  const [editMode, setEditMode] = useState(false);
  const [editingAvailable, setEditingAvailable] = useState(false);
  const [appliedOps, setAppliedOps] = useState<PreviewDomOp[]>([]);
  const [undoneOps, setUndoneOps] = useState<PreviewDomOp[]>([]);

  const readyTimeoutRef = useRef<number | null>(null);

  const iframeOrigin = useMemo(() => tryGetOrigin(displayUrl), [displayUrl]);

  const canUndo = appliedOps.length > 0;
  const canRedo = undoneOps.length > 0;

  const pendingEditsLabel = useMemo(() => {
    if (!appliedOps.length) return null;
    return `${appliedOps.length} change${appliedOps.length === 1 ? "" : "s"}`;
  }, [appliedOps.length]);

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
  }, [editMode, iframeOrigin, iframeRef]);

  const onIframeLoad = () => {
    setEditingAvailable(false);
    if (readyTimeoutRef.current) window.clearTimeout(readyTimeoutRef.current);
    readyTimeoutRef.current = window.setTimeout(() => {
      setEditingAvailable(false);
    }, 1500);

    postToIframe({ type: "PING" });
  };

  const onToggleEditMode = () => {
    if (!editingAvailable) return;
    setEditMode((prev) => {
      const next = !prev;
      postToIframe({ type: "SET_EDIT_MODE", enabled: next });
      return next;
    });
  };

  const onUndo = () => {
    if (!appliedOps.length) return;
    const op = appliedOps[appliedOps.length - 1];
    setAppliedOps((prev) => prev.slice(0, -1));
    setUndoneOps((prev) => [...prev, op]);
    postToIframe({ type: "REVERT_OP", op });
  };

  const onRedo = () => {
    if (!undoneOps.length) return;
    const op = undoneOps[undoneOps.length - 1];
    setUndoneOps((prev) => prev.slice(0, -1));
    setAppliedOps((prev) => [...prev, op]);
    postToIframe({ type: "APPLY_OP", op });
  };

  const onSaveEdits = async () => {
    if (!appliedOps.length) {
      toast("No changes to save");
      return;
    }

    try {
      await generateClient.saveEdits({
        route: displayUrl,
        genId,
        chatId,
        operations: appliedOps,
      });
      toast.success("Saved edits");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save edits");
    }
  };

  const onClearEdits = () => {
    setAppliedOps([]);
    setUndoneOps([]);
  };

  return {
    editMode,
    editingAvailable,
    appliedOps,
    canUndo,
    canRedo,
    pendingEditsLabel,
    onIframeLoad,
    onToggleEditMode,
    onUndo,
    onRedo,
    onSaveEdits,
    onClearEdits,
  } as const;
}

