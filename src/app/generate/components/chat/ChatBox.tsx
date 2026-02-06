import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ArrowUp, Loader2 } from "lucide-react";
import { useEffect, useMemo, useRef } from "react";

const PLACEHOLDERS = [
  "Describe what you want to build…",
  "Build a landing page for a coffee shop",
  "Create a pricing section with 3 tiers",
  "Design a portfolio homepage",
  "Make a minimalist blog layout",
];

export default function ChatBox({
  prompt,
  submitPrompt,
  setPrompt,
  isResponseLoading,
  generatingsite,
}: {
  prompt: string;
  submitPrompt: (e?: React.FormEvent | React.KeyboardEvent) => void;
  setPrompt: (p: string) => void;
  isResponseLoading: boolean;
  generatingsite: boolean;
}) {
  const isLoading = isResponseLoading || generatingsite;
  const placeholderIndex = useMemo(
    () => Math.floor(Math.random() * PLACEHOLDERS.length),
    [],
  );

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  /* Auto-grow textarea */
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;

    el.style.height = "0px";
    el.style.height = Math.min(el.scrollHeight, 192) + "px";
  }, [prompt]);

  const canSubmit = prompt.trim().length > 0 && !isLoading;

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!canSubmit) return;
        submitPrompt(e);
      }}
      className={cn(
        "sticky bottom-2 left-0 right-0 mx-auto flex w-full max-w-3xl items-end gap-2",
        "rounded-2xl border border-border/60",
        "bg-muted/80 backdrop-blur-md",
        "p-2 md:px-3 md:py-4 shadow-sm",
      )}
    >
      <textarea
        ref={textareaRef}
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            if (canSubmit) submitPrompt(e);
          }
        }}
        placeholder={PLACEHOLDERS[placeholderIndex]}
        rows={1}
        aria-label="Prompt"
        className={cn(
          "flex-1 resize-none bg-transparent px-3 py-2 pb-2 text-sm",
          "border-0 outline-none ring-0 focus:outline-none focus:ring-0",
          "max-h-48 text-foreground placeholder:text-muted-foreground/70",
          "appearance-none",
          isLoading && "opacity-70",
        )}
      />

      <Button
        type="submit"
        disabled={!canSubmit}
        aria-label="Send"
        className={cn(
          "h-10 w-10 shrink-0 rounded-full p-0 shadow-sm transition-all",
          canSubmit ? "hover:bg-accent" : "cursor-not-allowed opacity-60",
        )}
      >
        {isLoading ? (
          <Loader2 className="animate-spin" size={18} />
        ) : (
          <ArrowUp size={18} />
        )}
        <span className="sr-only">Send</span>
      </Button>
    </form>
  );
}
