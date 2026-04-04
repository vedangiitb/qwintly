"use client";

import { useGenerateUi } from "@/features/generate/ui/hooks/useGenerateUi";
import { useGenerate } from "../hooks/useGenerate";
import PreviewFrame from "./PreviewFrame";
import PreviewTopbar from "./Topbar/PreviewTopbar";

export default function PreviewPanel() {
  const { url } = useGenerate();
  const { width } = useGenerateUi();

  return (
    <div className="h-full flex flex-col p-2">
      <PreviewTopbar />

      {url ? (
        <iframe
          id="preview-frame"
          key={url}
          src={url}
          style={{
            margin: "auto",
            height: "800px",
            width: width,
            border: "1px solid #ddd",
            borderRadius: "6px",
          }}
        />
      ) : (
        <PreviewFrame />
      )}
    </div>
  );
}
