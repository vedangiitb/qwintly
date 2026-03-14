"use client";
import { useGenerate } from "@/features/generate/ui/hooks/useGenerate";
import { useChatContext } from "@/features/chat/ui/hooks/chatContext";
import { useEffect, useRef } from "react";

export default function GeneratingStatus() {
  const { chatId } = useChatContext();
  const { isGenerating, currentStatus, activeChatId, streamGenerationStatus } =
    useGenerate();
  const streamAbortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!isGenerating) {
      streamAbortRef.current?.abort();
      streamAbortRef.current = null;
      return;
    }

    const resolvedChatId = activeChatId ?? chatId;
    if (!resolvedChatId) return;

    streamAbortRef.current?.abort();
    const controller = new AbortController();
    streamAbortRef.current = controller;

    void streamGenerationStatus({
      chatId: resolvedChatId,
      signal: controller.signal,
    }).catch((error) => {
      console.error(error.message);
    });

    return () => {
      if (streamAbortRef.current === controller) {
        streamAbortRef.current = null;
      }
      controller.abort();
    };
  }, [isGenerating, activeChatId, chatId, streamGenerationStatus]);

  if (!isGenerating) return null;

  return (
    <div className="mb-4 flex items-center gap-3 rounded-2xl border bg-muted/40 px-4 py-3">
      {/* Spinner */}
      <div className="h-4 w-4 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />

      {/* Text */}
      <div className="flex flex-col">
        <p className="text-sm font-medium">Generating your site</p>
        <p
          className="
    text-xs
    font-medium
    bg-linear-to-r
    from-muted-foreground
    via-primary
    to-muted-foreground
    bg-size-[200%_100%]
    bg-clip-text
    text-transparent
    animate-text-shimmer
    transition-opacity duration-300
  "
        >
          {currentStatus || "Setting things up"}
          <span className="animate-typing-dots"></span>
        </p>
      </div>
    </div>
  );
}
