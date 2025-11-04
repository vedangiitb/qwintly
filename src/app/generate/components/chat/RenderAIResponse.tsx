"use client";

import React from "react";
import ReactMarkdown from "react-markdown";
import { cn } from "@/lib/utils"; // from shadcn
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";

export default function RenderAIResponse({ data }: { data: string }) {
  return (
    <div className="flex items-start gap-3 my-4">
      {/* Avatar */}
      <Avatar className="hidden sm:flex h-8 w-8 ring-2 ring-indigo-400/40">
        <AvatarFallback>⚡</AvatarFallback>
      </Avatar>

      {/* Message bubble */}
      <Card
        className={cn(
          "w-full md:max-w-[75%] px-4 py-2 rounded-2xl",
          "bg-muted/40 text-primary text-sm md:text-base",
          "border-2 border-border transition-all",
        )}
        style={{ willChange: "transform" }}
      >
        <ReactMarkdown
          components={{
            code({ className, children, ...props }) {
              return (
                <code
                  className={cn(
                    "rounded bg-muted px-1.5 py-0.5 text-xs font-mono text-indigo-300",
                    className
                  )}
                  {...props}
                >
                  {children}
                </code>
              );
            },
            pre({ children, ...props }) {
              return (
                <pre
                  className="rounded-lg bg-zinc-900/80 p-3 overflow-x-auto text-xs text-blue-100"
                  {...props}
                >
                  {children}
                </pre>
              );
            },
            p({ children }) {
              return <p className="leading-relaxed my-1">{children}</p>;
            },
            li({ children }) {
              return <li className="my-0.5">{children}</li>;
            },
          }}
        >
          {data}
        </ReactMarkdown>
      </Card>
    </div>
  );
}
