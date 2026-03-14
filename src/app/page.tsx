"use client";

import { useAuth } from "@/features/auth/ui/hooks/useAuth";
import ChatBox from "@/features/chat/ui/components/ChatBox";
import SideBar from "@/components/layouts/sidebar/sidebar";
import { useChat } from "@/features/chat/ui/hooks/useChat";
import { useRouter } from "next/navigation";
import { FormEvent, KeyboardEvent, useEffect, useState } from "react";
import { toast } from "sonner";

export default function Home() {
  const router = useRouter();
  const { user } = useAuth();
  const [showSidebar, setShowSidebar] = useState(false);
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
    if (showSidebar) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
  }, [showSidebar]);

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
    <div className="h-full text-foreground flex">
      <SideBar
        sidebarExpanded={showSidebar}
        setSidebarExpanded={setShowSidebar}
      />

      <div className="w-full flex flex-col h-full">
        <main className="flex-1 relative overflow-hidden">
          <div className="h-[calc(100vh-5rem)] relative z-10 flex flex-col items-center justify-center px-4 py-4 md:py-12 text-center gap-10 md:gap-12">
            <h1 className="relative text-4xl md:text-6xl font-black tracking-tight bg-clip-text text-transparent bg-linear-to-tr dark:from-teal-200 dark:via-purple-300 dark:to-pink-400 from-teal-500 via-purple-600 to-pink-600 drop-shadow-2xl animate-fadein-smooth">
              <span className="block mb-2 animate-gradient-move">
                Build Your Dream App
              </span>
              <span className="block text-3xl md:text-5xl font-bold bg-clip-text text-transparent bg-linear-to-br dark:from-white dark:via-purple-100 dark:to-cyan-200 opacity-90 from-slate-700 via-purple-600 to-cyan-600">
                in Just a Few Clicks
              </span>
              <span className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-2/3 h-8 bg-linear-to-r from-purple-300 via-transparent to-cyan-200 blur-2xl opacity-60 pointer-events-none"></span>
            </h1>
            <p className="text-base md:text-xl dark:text-slate-200/90 text-slate-800/90 font-medium leading-relaxed max-w-xl mx-auto drop-shadow-lg">
              Describe your idea and let{" "}
              <span className="font-semibold dark:text-teal-300 text-teal-500">
                Qwintly
              </span>{" "}
              turn it into reality with the power of AI.
              <br className="hidden md:block" />
              <span className="dark:text-white text-gray-800 font-semibold">
                It&apos;s truly that simple.
              </span>
            </p>

            <div className="w-full max-w-2xl mx-auto">
              <ChatBox
                prompt={prompt}
                submitPrompt={submitPrompt}
                setPrompt={setPrompt}
                isResponseLoading={isGeneratingResponse}
                generatingsite={false}
              />
              {!user?.id ? (
                <p className="mt-4 text-slate-400 text-xs opacity-90 select-none">
                  <b>No pricing setup needed</b> to try the demo, sign in to
                  save your progress and unlock full features.
                </p>
              ) : null}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
