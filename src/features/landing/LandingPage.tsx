"use client";

import React, { useState, useEffect, FormEvent, KeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAuth } from "@/features/auth/ui/hooks/useAuth";
import { useChat } from "@/features/chat/ui/hooks/useChat";
import SideBar from "@/components/layouts/sidebar/sidebar";
import { Hero } from "./components/Hero";
import { Features } from "./components/Features";
import { HowItWorks } from "./components/HowItWorks";

export const LandingPage: React.FC = () => {
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
    <div className="h-full flex text-stone-900 dark:text-stone-100">
      <SideBar
        sidebarExpanded={showSidebar}
        setSidebarExpanded={setShowSidebar}
      />

      <div className="w-full flex flex-col h-full min-h-0 overflow-y-auto custom-scrollbar bg-[linear-gradient(180deg,#f7f3ea_0%,#f2efe6_55%,#ece8df_100%)] dark:bg-[linear-gradient(180deg,#111111_0%,#171717_55%,#1c1917_100%)]">
        <main className="flex-1 min-h-0">
          <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-14 space-y-16">
            <Hero
              prompt={prompt}
              setPrompt={setPrompt}
              submitPrompt={submitPrompt}
              isGeneratingResponse={isGeneratingResponse}
              user={user}
            />
            <Features />
            <HowItWorks />

            <footer className="border-t border-stone-200/70 py-10 text-center text-sm text-stone-500 dark:border-stone-800/70 dark:text-stone-400">
              &copy; {new Date().getFullYear()} Qwintly. Built with AI for the
              future of development.
            </footer>
          </div>
        </main>
      </div>
    </div>
  );
};

export default LandingPage;
