"use client";

import React from "react";
import { BookOpen, ArrowRight } from "lucide-react";

export const DocsLink: React.FC = () => {
  return (
    <div className="w-full animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-200">
      <a
        href="https://docs.qwintly.com"
        target="_blank"
        rel="noopener noreferrer"
        className="group relative block overflow-hidden rounded-3xl border border-stone-200/40 bg-white/45 p-6 md:p-8 shadow-[0_12px_40px_rgba(0,0,0,0.01)] hover:shadow-[0_12px_45px_rgba(0,0,0,0.04)] dark:shadow-[0_12px_40px_rgba(0,0,0,0.08)] dark:hover:shadow-[0_12px_45px_rgba(0,0,0,0.15)] backdrop-blur-xl dark:border-stone-800/40 dark:bg-stone-900/45 transition-all duration-500"
      >
        {/* Glow effect on hover */}
        <div className="absolute -inset-px rounded-3xl bg-linear-to-r from-teal-500/10 via-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start md:items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-stone-200/40 bg-white/60 shadow-xs dark:border-stone-800/40 dark:bg-stone-900/60 transition-transform duration-500 group-hover:scale-105">
              <BookOpen className="h-5.5 w-5.5 text-teal-600 dark:text-teal-400" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg md:text-xl font-semibold tracking-tight text-stone-900 dark:text-stone-50">
                Explore the Qwintly Documentation
              </h3>
              <p className="text-sm text-stone-600 dark:text-stone-300 leading-relaxed max-w-2xl">
                Learn about the architecture of qwintly and how we build your
                application. Get to know about the features and use cases.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 font-medium text-sm text-teal-700 dark:text-teal-400 transition-all duration-300 group-hover:translate-x-1 shrink-0">
            <span>Read the Docs</span>
            <ArrowRight className="h-4 w-4" />
          </div>
        </div>
      </a>
    </div>
  );
};

export default DocsLink;
