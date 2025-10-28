"use client";

import React, { useEffect, useState, useRef } from "react";
import { usePrompt } from "../hooks/chat/PromptContext";
import ChatHistory from "../components/chat/ChatHistory";
import ChatBox from "../components/chat/ChatBox";
import { useChat } from "../hooks/chat/useChat";

type Props = { params: Promise<{ id: string }> };

export default function Generate({ params }: Props) {
  const { id } = React.use(params);
  const [generatingsite, setSiteGenerating] = useState(false);
  const { prompt, setPrompt } = usePrompt();
  const { submitResponse, messages, hasSubmittedRef } = useChat();

  useEffect(() => {
    console.log(prompt, id);
    if (prompt && id && !hasSubmittedRef.current) {
      hasSubmittedRef.current = true;
      submitResponse(id);
    }
  }, [id, prompt]);

  return (
    <div className="pl-4 pr-2 pb-2 h-full flex flex-col justify-between overflow-hidden shadow-xl backdrop-blur-2xl bg-background">
      <ChatHistory
        convHistory={messages}
        isResponseLoading={false}
        generatingsite={generatingsite}
      />
      <ChatBox
        prompt={prompt}
        submitPrompt={() => submitResponse(id)}
        setPrompt={setPrompt}
        isResponseLoading={false}
      />
    </div>
  );
}
