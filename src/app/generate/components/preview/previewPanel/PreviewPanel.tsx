import { useChat } from "@/app/generate/hooks/chat/useChat";
import { useChatUi } from "@/app/generate/hooks/chat/useChatUi";
import PreviewFrame from "./PreviewFrame";
import PreviewTopbar from "./Topbar/PreviewTopbar";
export default function PreviewPanel() {
  const { generateStatus, genUrl } = useChat();
  const { width } = useChatUi();
  return (
    <div className="h-full flex flex-col p-2">
      <PreviewTopbar />

      {generateStatus && genUrl ? (
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
