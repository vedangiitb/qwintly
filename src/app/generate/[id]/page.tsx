"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ChatBox from "../components/chat/ChatBox";
import ChatHistory from "../components/chat/ChatHistory";
import { usePrompt } from "../hooks/chat/PromptContext";
import { useChat } from "../hooks/chat/useChat";
import { toast } from "sonner";

type Props = { params: Promise<{ id: string }> };

export default function Generate({ params }: Props) {
  const { id } = React.use(params);
  const [generatingsite, setSiteGenerating] = useState(false);
  const router = useRouter();
  const { prompt, setPrompt } = usePrompt();
  const {
    submitResponse,
    messages,
    hasSubmittedRef,
    fetchChat,
    isResponseLoading,
  } = useChat();

  useEffect(() => {
    const run = async () => {
      if (!id || hasSubmittedRef.current) return;
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
    <div className="flex flex-col flex-1 w-full justify-between bg-background shadow-xl backdrop-blur-2xl overflow-hidden">
      <div className="flex-1 overflow-y-auto px-2 py-4 custom-scrollbar">
        <ChatHistory
          convHistory={messages}
          isResponseLoading={isResponseLoading}
          generatingsite={generatingsite}
        />
      </div>
      <ChatBox
        prompt={prompt}
        submitPrompt={() => submitResponse(id)}
        setPrompt={setPrompt}
        isResponseLoading={isResponseLoading}
      />
    </div>
  );
}
