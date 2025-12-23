"use client";
import { useChat } from "../../hooks/chat/useChat";

export default function GeneratingStatus() {
  const { generatingStatus, generatingsite } = useChat();

  if (!generatingsite) return null;

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
    bg-gradient-to-r
    from-muted-foreground
    via-primary
    to-muted-foreground
    bg-[length:200%_100%]
    bg-clip-text
    text-transparent
    animate-text-shimmer
    transition-opacity duration-300
  "
        >
          {generatingStatus || "Setting things up"}
          <span className="animate-typing-dots"></span>
        </p>
      </div>
    </div>
  );
}
