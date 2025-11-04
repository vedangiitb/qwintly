"use client";
import ChatBox from "./components/chat/ChatBox";
import { usePrompt } from "./hooks/chat/PromptContext";
import { useInitConv } from "./hooks/useInitConv";

export default function Generate() {
  const { prompt, setPrompt } = usePrompt();

  const { initiateConversation, loading } = useInitConv();
  return (
    <div className="w-full pl-4 pr-2 pb-2 h-screen flex justify-center overflow-hidden shadow-xl backdrop-blur-2xl bg-background">
      <div className="py-4 my-auto max-w-3xl text-center">
        <p className="md:text-4xl text-2xl">Start with your application by typing your first message</p>
      </div>

      <ChatBox
        prompt={prompt}
        submitPrompt={initiateConversation}
        setPrompt={setPrompt}
        isResponseLoading={loading}
      />
    </div>
  );
}
