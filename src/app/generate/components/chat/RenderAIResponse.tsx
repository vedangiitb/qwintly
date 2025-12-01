"use client";

import React from "react";
import ReactMarkdown from "react-markdown";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";

export default function RenderAIResponse({ data }: { data: string }) {
  let displayMessage: string = data;

  // Try to parse JSON from agent
  try {
    console.log(data)
    let cleaned = data.trim();

    // remove ```json ... ``` or ``` ... ```
    cleaned = cleaned
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .trim();

    const firstBraceIndex = cleaned.indexOf("{");

    if (firstBraceIndex !== -1) {
      cleaned = cleaned.slice(firstBraceIndex);
    }

    console.log(cleaned);

    const parsed = JSON.parse(cleaned);
    console.log(parsed);

    // If structured agent output → render nextQuestion or completion message
    if (parsed?.status === "COLLECTING" && parsed?.nextQuestion) {
      displayMessage = parsed.nextQuestion;
    }

    if (parsed?.status === "COMPLETE") {
      displayMessage =
        "Great! I have everything. Generating your website now...";
    }
  } catch (e) {
    console.error(e);
    // Not JSON → just render as markdown (normal LLM message)
  }

  return (
    <div className="flex items-start gap-3 my-4">
      <Avatar className="hidden sm:flex h-8 w-8 ring-2 ring-indigo-400/40">
        <AvatarFallback>⚡</AvatarFallback>
      </Avatar>

      <Card
        className={cn(
          "w-full md:max-w-[75%] px-4 py-2 rounded-2xl",
          "bg-muted/40 text-primary text-sm md:text-base",
          "border transition-all"
        )}
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
          }}
        >
          {displayMessage}
        </ReactMarkdown>
      </Card>
    </div>
  );
}
