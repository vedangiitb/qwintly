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
    <section className="relative pt-20 pb-16 md:pt-32 md:pb-24 overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-teal-500/10 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 blur-[120px] rounded-full animate-pulse" />
      </div>

      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 mb-4">
            <Sparkles className="w-3 h-3 text-teal-500" />
            <span>AI-Powered App Generation</span>
          </div>

          <h1 className="text-4xl md:text-7xl font-bold tracking-tight text-slate-900 dark:text-white leading-[1.1]">
            Build Your Dream App{" "}
            <span className="bg-clip-text text-transparent bg-linear-to-tr dark:from-teal-200 dark:via-purple-300 dark:to-pink-400 from-teal-500 via-purple-600 to-pink-600 animate-text-shimmer bg-[length:200%_auto]">
              in Seconds
            </span>
          </h1>

          <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Qwintly turns your ideas into reality. Describe what you want, and watch as AI builds your fully functional application.
          </p>

          <div className="w-full max-w-2xl mx-auto pt-4 relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-teal-500/20 via-purple-500/20 to-pink-500/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative">
              <ChatBox
                prompt={prompt}
                submitPrompt={submitPrompt}
                setPrompt={setPrompt}
                isResponseLoading={isGeneratingResponse}
                generatingsite={false}
              />
            </div>
            {!user?.id && (
              <p className="mt-4 text-slate-400 text-sm animate-in fade-in duration-1000 delay-500">
                <b>No cost to try.</b> Sign in to save your progress and unlock full features.
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
