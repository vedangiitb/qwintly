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

      <div className="mx-auto max-w-4xl text-center space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
        <div className="inline-flex items-center gap-2 rounded-full border border-stone-200/80 bg-white/55 px-3 py-1 text-xs font-semibold text-stone-600 backdrop-blur-sm dark:border-stone-800/70 dark:bg-stone-950/40 dark:text-stone-300">
          <Sparkles className="w-3 h-3 text-teal-600 dark:text-teal-300" />
          <span>AI-Powered App Generation</span>
        </div>

        <h1 className="text-4xl font-bold tracking-tight leading-[1.08] text-stone-900 sm:text-6xl md:text-7xl dark:text-stone-50">
          Build Your Dream App with{" "}
          <span className="bg-clip-text text-transparent bg-linear-to-tr from-teal-600 via-purple-600 to-pink-600 dark:from-teal-200 dark:via-purple-300 dark:to-pink-400 animate-text-shimmer bg-[length:200%_auto]">
            Qwintly
          </span>{" "}
          in Seconds
        </h1>

        <p className="mx-auto max-w-2xl text-lg leading-relaxed text-stone-600 md:text-xl dark:text-stone-300">
          Qwintly turns your ideas into reality. Describe what you want, and watch
          as AI builds your fully functional application.
        </p>

        <div className="relative mx-auto w-full max-w-2xl pt-2">
          <div className="relative rounded-2xl border border-stone-200/80 bg-white/55 p-2 shadow-sm backdrop-blur-sm dark:border-stone-800/70 dark:bg-stone-950/35">
            <ChatBox
              prompt={prompt}
              submitPrompt={submitPrompt}
              setPrompt={setPrompt}
              isResponseLoading={isGeneratingResponse}
              generatingsite={false}
            />
          </div>

          {!user?.id && (
            <p className="mt-4 text-sm text-stone-500 animate-in fade-in duration-1000 delay-500 dark:text-stone-400">
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
