"use client";

import React, { useEffect, useState } from "react";
import ChatBox from "../components/chat/ChatBox";
import ChatHistory from "../components/chat/ChatHistory";
import { usePrompt } from "../hooks/chat/PromptContext";
import { useChat } from "../hooks/chat/useChat";

type Props = { params: Promise<{ id: string }> };

export default function Generate({ params }: Props) {
  const { id } = React.use(params);
  const [generatingsite, setSiteGenerating] = useState(false);
  const { prompt, setPrompt } = usePrompt();
  const {
    submitResponse,
    messages,
    hasSubmittedRef,
    fetchChat,
    isResponseLoading,
  } = useChat();

  useEffect(() => {
    if (!id || hasSubmittedRef.current) return;
    if (prompt && !hasSubmittedRef.current) {
      hasSubmittedRef.current = true;
      submitResponse(id);
    } else if (!prompt) {
      fetchChat(id);
      hasSubmittedRef.current = true;
    }
  }, [id, prompt]);

  return (
    <div className="pl-4 pr-2 pb-2 h-full flex flex-col justify-between overflow-hidden shadow-xl backdrop-blur-2xl bg-background">
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
