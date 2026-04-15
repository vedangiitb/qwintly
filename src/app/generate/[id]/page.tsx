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
  const { isGenerating } = useGenerate();
  const { chatVisible } = useGenerateUi();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    // useEffect for loading chat messages and chat info
    const run = async () => {
      if (!id) return;
      try {
        await loadChat(id);
      } catch (err) {
        console.error("Failed to load chat", err);
        toast.error("Chat not found");
        router.push("/generate");
      }
    };
    run();
  }, [id, loadChat, router]);

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <ResizablePanelGroup direction={isMobile ? "vertical" : "horizontal"} className="h-full flex">
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
          className={`transition-all duration-300 bg-border/50 hover:bg-border/80 ${!chatVisible ? "hidden" : ""} ${isMobile ? "h-1.5 hover:h-2 w-full" : "w-1.5 hover:w-2 h-full"}`}
        />

        <ResizablePanel minSize={40} className="flex flex-col flex-1 p-3 lg:p-4 bg-muted/10">
          <PreviewPanel />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
