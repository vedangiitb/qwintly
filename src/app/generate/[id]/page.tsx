"use client";

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { useRouter } from "next/navigation";
import React, { useEffect } from "react";
import { toast } from "sonner";
import ChatBox from "../components/chat/ChatBox";
import ChatHistory from "../components/chat/ChatHistory";
import GeneratingStatus from "../components/chat/GeneratingStatus";
import PreviewPanel from "../components/preview/previewPanel/PreviewPanel";
import { useChat } from "../hooks/useChat";
import { useChatUi } from "../hooks/useChatUi";
import { useChatSession } from "../hooks/chatSessionContext";

type Props = { params: Promise<{ id: string }> };

export default function Generate({ params }: Props) {
  const { id } = React.use(params);
  const router = useRouter();
  const {
    prompt,
    setPrompt,
    submitResponse,
    messages,
    hasSubmittedRef,
    fetchChat,
    isResponseLoading,
    generatingsite,
  } = useChat();

  const { setChatId } = useChatSession();

  const { chatVisible } = useChatUi();

  useEffect(() => {
    const run = async () => {
      if (!id || hasSubmittedRef.current) return;
      setChatId(id);
      if (prompt && !hasSubmittedRef.current) {
        hasSubmittedRef.current = true;
        submitResponse(id);
      } else if (!prompt) {
        const isChatPresent = await fetchChat(id);
        hasSubmittedRef.current = true;
        if (!isChatPresent) {
          toast.error("Chat Not found");
          router.push("/generate");
        }
      }
    };
    run();
  }, [id, prompt]);

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <ResizablePanelGroup direction="horizontal" className="h-full flex">
        <ResizablePanel
          className={`flex flex-col flex-1 overflow-y-auto px-2 py-4 h-full ${!chatVisible ? "hidden" : ""}`}
        >
          <ChatHistory
            convHistory={messages}
            isResponseLoading={isResponseLoading}
            generatingsite={generatingsite}
          />
          <GeneratingStatus />
          <ChatBox
            prompt={prompt}
            submitPrompt={(e?: React.FormEvent) => {
              if (e) e.preventDefault();
              submitResponse(id);
            }}
            setPrompt={setPrompt}
            isResponseLoading={isResponseLoading}
            generatingsite={generatingsite}
          />
        </ResizablePanel>

        <ResizableHandle
          withHandle
          className={`${!chatVisible ? "hidden" : ""}`}
        />

        <ResizablePanel minSize={50} className={`flex flex-col flex-1 p-2`}>
          {/* <PreviewFrame /> */}
          <PreviewPanel />
        </ResizablePanel>
      </ResizablePanelGroup>
      {/* </div> */}
    </div>
  );
}
