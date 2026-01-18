import { useChat } from "@/app/generate/hooks/useChat";
import { useChatUi } from "@/app/generate/hooks/useChatUi";
import PreviewFrame from "./PreviewFrame";
import PreviewTopbar from "./Topbar/PreviewTopbar";
export default function PreviewPanel() {
  const { generated, genUrl } = useChat();
  const { width } = useChatUi();
  return (
    <div className="h-full flex flex-col p-2">
      <PreviewTopbar />

      {generated && genUrl ? (
        <iframe
          id="preview-frame"
          src={genUrl}
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
