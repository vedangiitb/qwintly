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
    <div className="h-full text-foreground flex bg-white dark:bg-slate-950">
      <SideBar
        sidebarExpanded={showSidebar}
        setSidebarExpanded={setShowSidebar}
      />

      <div className="w-full flex flex-col h-full overflow-y-auto custom-scrollbar">
        <main className="flex-1">
          <Hero 
            prompt={prompt}
            setPrompt={setPrompt}
            submitPrompt={submitPrompt}
            isGeneratingResponse={isGeneratingResponse}
            user={user}
          />
          <Features />
          <HowItWorks />
          
          <footer className="py-12 border-t border-slate-200 dark:border-slate-800 text-center">
             <p className="text-slate-500 dark:text-slate-400 text-sm">
                &copy; {new Date().getFullYear()} Qwintly. Built with AI for the future of development.
             </p>
          </footer>
        </main>
      </div>
    </div>
  );
};

export default LandingPage;
