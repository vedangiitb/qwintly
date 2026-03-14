"use client";

import { useAuth } from "@/features/auth/ui/hooks/useAuth";
import ChatBox from "@/features/chat/ui/components/ChatBox";
import { useChat } from "@/features/chat/ui/hooks/useChat";
import { useRouter } from "next/navigation";
import { FormEvent, KeyboardEvent, useEffect, useState } from "react";
import { toast } from "sonner";

export default function Generate() {
  const router = useRouter();
  const { user } = useAuth();
  const {
    chatId,
    prompt,
    setPrompt,
    sendMessage,
    isGeneratingResponse,
    resetActiveChatState,
  } = useChat();
  const [started, setStarted] = useState(false);

  useEffect(() => {
    resetActiveChatState();
  }, [resetActiveChatState]);

  useEffect(() => {
    if (started && chatId) {
      router.push(`/generate/${chatId}`);
      setStarted(false);
    }
  }, [chatId, router, started]);

  const submitPrompt = async (e?: FormEvent | KeyboardEvent) => {
    e?.preventDefault();

    if (!user) {
      router.push("/login");
      toast("Please login to continue");
      return;
    }

    if (!prompt.trim()) return;

    try {
      setStarted(true);
      await sendMessage(prompt);
    } catch (err) {
      setStarted(false);
      console.error("Failed to start chat", err);
      toast.error("Could not start conversation. Please try again.");
    }
  };

  return (
    <div className="w-full flex flex-col h-full pl-4 pr-2 pb-2 overflow-hidden shadow-xl backdrop-blur-2xl bg-background">
      <div className="flex-1 flex items-center justify-center pb-28">
        <div className="py-4 max-w-3xl text-center">
          <p className="md:text-4xl text-2xl">
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
