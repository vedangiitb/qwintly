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
    <div className="w-full md:px-2 pb-2 h-screen flex justify-center overflow-hidden shadow-xl backdrop-blur-2xl bg-background">
      <ChatHistory
        convHistory={messages}
        isResponseLoading={isResponseLoading}
        generatingsite={generatingsite}
      />
      <ChatBox
        prompt={prompt}
        submitPrompt={() => submitResponse(id)}
        setPrompt={setPrompt}
        isResponseLoading={isResponseLoading}
      />
    </div>
  );
}
