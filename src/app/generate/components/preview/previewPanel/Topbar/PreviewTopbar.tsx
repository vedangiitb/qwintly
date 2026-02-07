import {
  ExternalLink,
  PanelLeftClose,
  PanelLeftOpen,
  Save,
} from "lucide-react";
import { toast } from "sonner";
// import { updatedb } from "../../../services/updateDb";
import { useChatUi } from "@/app/generate/hooks/useChatUi";
import EditMode from "./EditMode";
// import StyleSettings from "./StyleSettings";
import { useChat } from "@/app/generate/hooks/useChat";
import { useState } from "react";
import WidthSetting from "./widthSetting";

export default function PreviewTopbar() {
  const {
    chatVisible,
    toggleChatVisible,
    width,
    setDeviceMode,
    editMode,
    toggleEditMode,
  } = useChatUi();
  const { generated, changes, setChanges, genUrl } = useChat();
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
    if (genUrl) window.open(genUrl, "_blank");
  };

  return (
    <div className="topbar flex items-center justify-between px-3 py-2 mb-3 select-none">
      <button
        aria-label={chatVisible ? "Close Chat Panel" : "Open Chat Panel"}
        onClick={() => toggleChatVisible()}
        className="topbar-icon"
      >
        {chatVisible ? (
          <PanelLeftClose className="w-5 h-5 text-muted-foreground" />
        ) : (
          <PanelLeftOpen className="w-5 h-5 text-muted-foreground" />
        )}
      </button>

      <h3 className="title select-text">Preview</h3>

      {/* Controls Panel */}
      {generated && setChanges ? (
        <div className="flex items-center gap-3">
          <EditMode editMode={editMode} toggleEditMode={toggleEditMode} />
          <WidthSetting width={width} setWidth={setDeviceMode} />
          <button
            aria-label="Save changes"
            role="button"
            disabled={!changes}
            className="topbar-icon"
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
                changes ? "text-foreground" : "text-muted-foreground"
              }`}
            />
          </button>

          {/* <StyleSettings
            stylesFromLLM={stylesFromLLM}
            setStylesFromLLM={setStylesFromLLM}
            initialStyles={initialStyles}
            setChanges={setChanges}
          /> */}

          <button
            aria-label="Open in new window"
            onClick={openInNewWindow}
            className="topbar-icon"
          >
            <ExternalLink className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>
      ) : (
        <div />
      )}

      <style jsx>{`
        .topbar {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 10px;
        }

        .topbar-icon {
          padding: 6px;
          border-radius: 8px;
          transition: background 160ms ease, color 160ms ease;
          outline: none;
        }

        .topbar-icon:hover {
          background: rgba(255, 255, 255, 0.06);
        }

        .topbar-icon:focus-visible {
          box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.18);
        }

        .title {
          font-size: 13px;
          font-weight: 500;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: rgba(255, 255, 255, 0.7);
        }
      `}</style>
    </div>
  );
}
