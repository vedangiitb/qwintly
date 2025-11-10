"use client";
import ChatBox from "./components/chat/ChatBox";
import { usePrompt } from "./hooks/chat/PromptContext";
import { useInitConv } from "./hooks/useInitConv";

export default function Generate() {
  const { prompt, setPrompt } = usePrompt();

  const { initiateConversation, loading } = useInitConv();
  return (
    <div className="w-full flex flex-col h-full pl-4 pr-2 pb-2 overflow-hidden shadow-xl backdrop-blur-2xl bg-background">
      {/* Main content: flex-1 so it takes remaining height */}
      <div className="flex-1 flex items-center justify-center pb-28">
        <div className="py-4 max-w-3xl text-center">
          <p className="md:text-4xl text-2xl">Start with your application by typing your first message</p>
        </div>
      </div>

      {/* ChatBox is fixed at the bottom; add bottom padding on content (pb-28) so content isn't covered */}
      <ChatBox
        prompt={prompt}
        submitPrompt={initiateConversation}
        setPrompt={setPrompt}
        isResponseLoading={loading}
      />
    </div>
  );
}
