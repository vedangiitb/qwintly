import {
  ExternalLink,
  PanelLeftClose,
  PanelLeftOpen,
  Save,
} from "lucide-react";
import { toast } from "sonner";
// import { updatedb } from "../../../services/updateDb";
import { useChatUi } from "@/app/generate/hooks/chat/useChatUi";
import EditMode from "./EditMode";
import StyleSettings from "./StyleSettings";
import WidthSetting from "./widthSetting";
import { useState } from "react";
import { useChat } from "@/app/generate/hooks/chat/useChat";

export default function PreviewTopbar({}: {}) {
  const {
    chatVisible,
    setChatVisible,
    width,
    setWidth,
    editMode,
    toggleEditMode,
  } = useChatUi();
  const { showPreview, changes, setChanges } = useChat();
  const initialStyles = {};
  const [detailsFromLLM, setDetailsFromLLM] = useState({});
  const [stylesFromLLM, setStylesFromLLM] = useState(initialStyles);
  const [heroImg, setHeroImg] = useState("");
  const updateDb = ({ style, content }: { style: any; content: any }) => {
    // const ret = await updatedb({
    //   style: stylesFromLLM,
    //   content: detailsFromLLM,
    // });
    // if (ret) {
    //   toast.success("Details updated successfully!");
    // }
    return true;
  };

  const openInNewWindow = () => {
    const previewData = {
      content: detailsFromLLM,
      styles: stylesFromLLM,
      heroImg: heroImg,
    };
    localStorage.setItem("previewData", JSON.stringify(previewData));
    window.open("/preview", "_blank");
  };

  return (
    <div className="glass-topbar flex items-center justify-between px-2 py-1 rounded-xl shadow-md border border-white/20 mb-3 select-none">
      <button
        aria-label={chatVisible ? "Close Chat Panel" : "Open Chat Panel"}
        onClick={() => setChatVisible()}
        className="p-1 rounded-md transition-colors duration-200 hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-teal-400"
      >
        {chatVisible ? (
          <PanelLeftClose className="w-5 h-5 text-chart-2" />
        ) : (
          <PanelLeftOpen className="w-5 h-5 text-chart-2" />
        )}
      </button>

      <h3 className="font-light tracking-wider select-text">Preview</h3>

      {/* Controls Panel */}
      {showPreview && setChanges ? (
        <div className="flex items-center gap-4">
          <EditMode editMode={editMode} toggleEditMode={toggleEditMode} />
          <WidthSetting width={width} setWidth={setWidth} />
          <button
            aria-label="Save changes"
            role="button"
            disabled={!changes}
            onClick={async () => {
              if (!changes) return;
              const ret = await updateDb({
                style: stylesFromLLM,
                content: detailsFromLLM,
              });
              if (ret) {
                toast.success("Details updated successfully!");
                setChanges(false);
              } else {
                toast.error("Error while updating details.");
              }
            }}
          >
            <Save
              className={`w-5 h-5 cursor-pointer ${
                changes ? "text-chart-2" : "text-muted-foreground"
              }`}
            />
          </button>

          <StyleSettings
            stylesFromLLM={stylesFromLLM}
            setStylesFromLLM={setStylesFromLLM}
            initialStyles={initialStyles}
            setChanges={setChanges}
          />

          <button
            aria-label="Open in new window"
            onClick={openInNewWindow}
            className="p-1 rounded-md hover:bg-white/20 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-teal-400"
          >
            <ExternalLink className="w-5 h-5 text-chart-2" />
          </button>
        </div>
      ) : (
        <div />
      )}

      <style jsx>{`
        .glass-topbar {
          background: linear-gradient(
            110deg,
            rgba(34, 34, 64, 0.18) 65%,
            rgba(195, 189, 255, 0.2) 100%
          );
          backdrop-filter: blur(24px) saturate(180%);
          box-shadow:
            0 2px 18px rgba(109, 231, 225, 0.09),
            0 1.5px 8px rgba(80, 68, 204, 0.05);
        }

        .text-gradient {
          background: linear-gradient(90deg, #4ade80, #818cf8, #f472b6);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
      `}</style>
    </div>
  );
}
