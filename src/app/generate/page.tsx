"use client";

import ChatBox from "@/features/chat/ui/components/ChatBox";
import { useInitChat } from "@/features/chat/ui/hooks/useInitChat";

export default function Generate() {
  const {
    prompt,
    setPrompt,
    submitPrompt,
    isGeneratingResponse,
  } = useInitChat();

  return (
    <div className="w-full flex flex-col h-full pl-4 pr-2 pb-2 overflow-hidden bg-transparent">
      <div className="flex-1 flex items-center justify-center pb-28">
        <div className="py-4 max-w-2xl text-center flex flex-col items-center gap-4">
          <p className="md:text-4xl text-2xl font-semibold tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-foreground to-muted-foreground p-2 text-balance leading-tight">
            Start with your application by typing your first message
          </p>
        </div>
      </div>

      <ChatBox
        prompt={prompt}
        submitPrompt={submitPrompt}
        setPrompt={setPrompt}
        isResponseLoading={isGeneratingResponse}
        generatingsite={false}
      />
    </div>
  );
}
