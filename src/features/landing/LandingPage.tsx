"use client";

import React, { useState, useEffect } from "react";
import SideBar from "@/components/layouts/sidebar/sidebar";
import { useAuth } from "@/features/auth/ui/hooks/useAuth";
import { useInitChat } from "@/features/chat/ui/hooks/useInitChat";
import { Hero } from "./components/Hero";
import { Features } from "./components/Features";
import { HowItWorks } from "./components/HowItWorks";
import { DocsLink } from "./components/DocsLink";
import Link from "next/link";

export const LandingPage: React.FC = () => {
  const { user } = useAuth();
  const [showSidebar, setShowSidebar] = useState(false);
  const {
    prompt,
    setPrompt,
    submitPrompt,
    isGeneratingResponse,
  } = useInitChat();

  useEffect(() => {
    if (showSidebar) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
  }, [showSidebar]);

  return (
    <div className="h-full flex text-stone-900 dark:text-stone-100">
      <SideBar
        sidebarExpanded={showSidebar}
        setSidebarExpanded={setShowSidebar}
      />

      <div className="w-full flex flex-col h-full min-h-0 overflow-y-auto custom-scrollbar bg-transparent">
        <main className="flex-1 min-h-0">
          <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-14 space-y-16">
            <Hero
              prompt={prompt}
              setPrompt={setPrompt}
              submitPrompt={submitPrompt}
              isGeneratingResponse={isGeneratingResponse}
              user={user}
            />
            <DocsLink />
            <Features />
            <HowItWorks />

            <footer className="border-t border-stone-200/70 py-10 text-center text-xs md:text-sm text-stone-500 dark:border-stone-800/70 dark:text-stone-400 flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                &copy; {new Date().getFullYear()} Qwintly. Built with AI for the future of development.
              </div>
              <div className="flex gap-4">
                <Link href="/privacy" className="hover:text-stone-900 dark:hover:text-stone-100 underline decoration-dotted underline-offset-4 transition-colors">
                  Privacy Policy
                </Link>
                <Link href="/terms" className="hover:text-stone-900 dark:hover:text-stone-100 underline decoration-dotted underline-offset-4 transition-colors">
                  Terms of Service
                </Link>
              </div>
            </footer>
          </div>
        </main>
      </div>
    </div>
  );
};

export default LandingPage;
