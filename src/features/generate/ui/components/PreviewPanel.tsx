"use client";

import { useGenerateUi } from "@/features/generate/ui/hooks/useGenerateUi";
import { useEffect, useState } from "react";
import { useGenerate } from "../hooks/useGenerate";
import PreviewFrame from "./PreviewFrame";
import PreviewTopbar from "./Topbar/PreviewTopbar";

export default function PreviewPanel() {
  const { url, previewUrl } = useGenerate();
  const { width } = useGenerateUi();

  const [displayUrl, setDisplayUrl] = useState(url || previewUrl);

  const updateDisplayUrl = (dispUrl: string) => {
    if (!dispUrl || dispUrl === displayUrl) return;
    setDisplayUrl(dispUrl);
  };

  useEffect(() => {
    updateDisplayUrl(previewUrl);
  }, [previewUrl]);

  return (
    <div className="h-full flex flex-col p-2">
      <PreviewTopbar
        updateDisplayUrl={updateDisplayUrl}
        displayUrl={displayUrl}
      />

      {url || previewUrl ? (
        <iframe
          id="preview-frame"
          key={url || previewUrl}
          src={url || previewUrl}
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
