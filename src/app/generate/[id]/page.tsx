"use client";

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import ChatBox from "@/features/chat/ui/components/ChatBox";
import ChatHistory from "@/features/chat/ui/components/ChatHistory";
import GeneratingStatus from "@/features/chat/ui/components/GeneratingStatus";
import { useChat } from "@/features/chat/ui/hooks/useChat";
import PreviewPanel from "@/features/generate/ui/components/PreviewPanel";
import { useGenerate } from "@/features/generate/ui/hooks/useGenerate";
import { useGenerateUi } from "@/features/generate/ui/hooks/useGenerateUi";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { MessageSquare, Globe } from "lucide-react";

type Props = { params: Promise<{ id: string }> };

export default function Generate({ params }: Props) {
  const { id } = React.use(params);
  const router = useRouter();
  const {
    prompt,
    setPrompt,
    sendMessage,
    messages,
    loadChat,
    isGeneratingResponse,
  } = useChat();
  const {
    isGenerating,
    setGenerating,
    setSiteUrl,
    setPreviewUrl,
    url,
    previewUrl,
  } = useGenerate();
  const { chatVisible } = useGenerateUi();
  const [isMobile, setIsMobile] = useState(false);
  const [activeTab, setActiveTab] = useState<"chat" | "preview">("chat");

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 796);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const resetChatState = () => {
    setGenerating(false);
    setSiteUrl(null);
    setPreviewUrl(null);
    setActiveTab("chat");
  };

  useEffect(() => {
    // useEffect for loading chat messages and chat info
    const run = async () => {
      if (!id) return;
      try {
        resetChatState();
        await loadChat(id);
      } catch (err) {
        console.error("Failed to load chat", err);
        toast.error("Chat not found");
        router.push("/generate");
      }
    };
    run();
  }, [id, loadChat, router]);

  const hasPreviewOrUrl = Boolean(url?.trim() || previewUrl?.trim());

  if (isMobile) {
    return (
      <div className="flex flex-col flex-1 overflow-hidden relative h-full">
        {hasPreviewOrUrl && (
          <div className="absolute top-2.5 left-1/2 -translate-x-1/2 z-50 flex items-center bg-background/95 backdrop-blur-md border border-border/80 p-0.5 rounded-full shadow-md transition-all duration-300">
            <button
              onClick={() => setActiveTab("chat")}
              className={`flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-semibold transition-all duration-200 ${
                activeTab === "chat"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <MessageSquare className="h-3 w-3" />
              <span>Chat</span>
            </button>
            <button
              onClick={() => setActiveTab("preview")}
              className={`flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-semibold transition-all duration-200 ${
                activeTab === "preview"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Globe className="h-3 w-3" />
              <span>Preview</span>
            </button>
          </div>
        )}

        <div className="flex-1 flex flex-col overflow-hidden h-full">
          {activeTab === "chat" ? (
            <div className={`flex flex-col flex-1 overflow-y-auto px-2 py-4 h-full ${hasPreviewOrUrl ? "pt-12" : ""}`}>
              <ChatHistory
                convHistory={messages}
                isResponseLoading={isGeneratingResponse}
                isGenerating={isGenerating}
              />
              {isGenerating && <GeneratingStatus />}
              <ChatBox
                prompt={prompt}
                submitPrompt={async (e?: React.FormEvent | React.KeyboardEvent) => {
                  e?.preventDefault();
                  await sendMessage(prompt);
                }}
                setPrompt={setPrompt}
                isResponseLoading={isGeneratingResponse}
                generatingsite={isGenerating}
              />
            </div>
          ) : (
            <div className={`flex flex-col flex-1 bg-muted/10 h-full overflow-hidden ${hasPreviewOrUrl ? "pt-12" : ""}`}>
              <PreviewPanel />
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <ResizablePanelGroup
        direction="horizontal"
        className="h-full flex"
      >
        <ResizablePanel
          className={`flex flex-col flex-1 overflow-y-auto px-2 py-4 h-full ${!chatVisible ? "hidden" : ""}`}
        >
          <ChatHistory
            convHistory={messages}
            isResponseLoading={isGeneratingResponse}
            isGenerating={isGenerating}
          />
          {isGenerating && <GeneratingStatus />}
          <ChatBox
            prompt={prompt}
            submitPrompt={async (e?: React.FormEvent | React.KeyboardEvent) => {
              e?.preventDefault();
              await sendMessage(prompt);
            }}
            setPrompt={setPrompt}
            isResponseLoading={isGeneratingResponse}
            generatingsite={isGenerating}
          />
        </ResizablePanel>

        <ResizableHandle
          withHandle
          className={`transition-all duration-300 bg-border/50 hover:bg-border/80 ${!chatVisible ? "hidden" : ""} w-1.5 hover:w-2 h-full`}
        />

        <ResizablePanel
          minSize={30}
          className="flex flex-col flex-1 bg-muted/10"
        >
          <PreviewPanel />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}

