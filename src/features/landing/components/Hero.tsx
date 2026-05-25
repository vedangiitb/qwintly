"use client";

import React from "react";
import ChatBox from "@/features/chat/ui/components/ChatBox";
import { Sparkles } from "lucide-react";

interface HeroProps {
  prompt: string;
  setPrompt: (prompt: string) => void;
  submitPrompt: (e?: React.FormEvent | React.KeyboardEvent) => void;
  isGeneratingResponse: boolean;
  user: any;
}

export const Hero: React.FC<HeroProps> = ({
  prompt,
  setPrompt,
  submitPrompt,
  isGeneratingResponse,
  user,
}) => {
  return (
    <section className="relative overflow-hidden pt-10 sm:pt-14">
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <div className="absolute top-[-18%] left-[-15%] h-[52%] w-[52%] rounded-full bg-teal-500/12 blur-[140px]" />
        <div className="absolute bottom-[-20%] right-[-15%] h-[52%] w-[52%] rounded-full bg-purple-500/10 blur-[140px]" />
      </div>

      <div className="mx-auto max-w-4xl text-center space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-1000">
        <div className="inline-flex items-center gap-2 rounded-full border border-stone-200/35 bg-white/50 px-4 py-1.5 text-xs font-semibold text-stone-600 backdrop-blur-md dark:border-stone-800/35 dark:bg-stone-900/50 dark:text-stone-300 shadow-[0_2px_8px_rgba(0,0,0,0.01)]">
          <Sparkles className="w-3.5 h-3.5 text-teal-600 dark:text-teal-300 animate-pulse" />
          <span className="tracking-wide">AI-Powered App Generation</span>
        </div>

        <h1 className="text-4xl font-bold tracking-tight leading-[1.08] text-stone-900 sm:text-6xl md:text-7xl dark:text-stone-50 select-none">
          Build Your Dream App with{" "}
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-teal-600 via-purple-600 to-pink-600 dark:from-teal-200 dark:via-purple-300 dark:to-pink-400 animate-text-shimmer bg-[length:200%_auto]">
            Qwintly
          </span>{" "}
          in Seconds
        </h1>

        <p className="mx-auto max-w-2xl text-lg leading-relaxed text-stone-600 md:text-xl dark:text-stone-300 select-none">
          Qwintly turns your ideas into reality. Describe what you want, and watch
          as AI builds your fully functional application.
        </p>

        <div className="relative mx-auto w-full max-w-2xl pt-2">
          <div className="relative rounded-3xl border border-stone-200/40 bg-white/40 p-2.5 shadow-[0_24px_70px_rgba(28,25,23,0.04)] hover:shadow-[0_24px_70px_rgba(28,25,23,0.08)] dark:shadow-[0_24px_70px_rgba(0,0,0,0.15)] dark:hover:shadow-[0_24px_70px_rgba(0,0,0,0.22)] backdrop-blur-xl dark:border-stone-800/35 dark:bg-stone-900/40 transition-all duration-500">
            <ChatBox
              prompt={prompt}
              submitPrompt={submitPrompt}
              setPrompt={setPrompt}
              isResponseLoading={isGeneratingResponse}
              generatingsite={false}
            />
          </div>

          {!user?.id && (
            <p className="mt-4 text-xs text-stone-500/90 animate-in fade-in duration-1000 delay-500 dark:text-stone-400/90 select-none">
              <b>No cost to try.</b> Sign in to save your progress and unlock
              full features.
            </p>
          )}
        </div>
      </div>
    </section>
  );
};

export default Hero;
