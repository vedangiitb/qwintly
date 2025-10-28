"use client";

import React from "react";
import ReactMarkdown from "react-markdown";

export default function RenderAIResponse({ data }: { data: string }) {
  return (
    <div className="flex items-start gap-3 px-2 my-5">
      {/* Avatar bubble */}
      <div className="hidden sm:flex items-center justify-center h-8 w-8 rounded-full bg-gradient-to-tr from-sky-400 via-indigo-400 to-purple-400 shadow-md border border-white/10 mt-2 ring-2 ring-indigo-300/50 animate-in fade-in zoom-in-0">
        <span className="text-lg">⚡</span>
      </div>

      {/* Message bubble */}
      <div
        className="relative group max-w-[85%] sm:max-w-[75%] px-5 py-3 rounded-3xl
        bg-gradient-to-br from-zinc-800/80 via-zinc-900/90 to-black/90
        text-zinc-100 shadow-lg border border-zinc-700/30 backdrop-blur-md
        animate-in fade-in slide-in-from-left-4 prose prose-invert prose-sm sm:prose-base
        hover:border-indigo-400/40 hover:shadow-indigo-500/20 transition-all duration-300"
        tabIndex={0}
      >
        <ReactMarkdown
          components={{
            code({ className, children, ...props }) {
              return (
                <code
                  className={`rounded px-1.5 py-0.5 text-sm font-mono bg-black/30 text-sky-300 ${
                    className || ""
                  }`}
                  {...props}
                >
                  {children}
                </code>
              );
            },
            pre({ children, ...props }) {
              return (
                <pre
                  className="rounded-xl p-4 overflow-x-auto my-3 font-mono text-sm leading-relaxed
                  bg-gradient-to-br from-zinc-950/90 via-zinc-900/80 to-zinc-800/70
                  text-blue-100 shadow-inner border border-zinc-700/40"
                  {...props}
                >
                  {children}
                </pre>
              );
            },
            p({ children }) {
              return (
                <p className="my-2 leading-relaxed text-[0.95rem]">
                  {children}
                </p>
              );
            },
            li({ children }) {
              return <li className="my-1">{children}</li>;
            },
          }}
        >
          {data}
        </ReactMarkdown>

        {/* Glowing accent */}
        <div className="absolute -left-2 bottom-5 w-4 h-4 rounded-full bg-gradient-to-tr from-sky-400 via-purple-400 to-indigo-300 blur-md opacity-50 group-hover:opacity-80 transition-opacity duration-300" />
      </div>
    </div>
  );
}
