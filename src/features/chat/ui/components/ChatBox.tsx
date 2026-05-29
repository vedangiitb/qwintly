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
        "relative z-10 mx-auto flex w-full max-w-3xl items-end gap-2 shrink-0 my-1 md:my-2 px-1",
        "rounded-3xl border border-stone-200/40 dark:border-stone-800/40",
        "bg-white/40 dark:bg-stone-900/40 backdrop-blur-xl",
        "p-1.5 shadow-[0_12px_40px_rgba(28,25,23,0.03)] dark:shadow-[0_12px_40px_rgba(0,0,0,0.18)]",
        "transition-all duration-300 focus-within:border-teal-500/50 focus-within:ring-4 focus-within:ring-teal-500/10",
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
          "flex-1 resize-none bg-transparent px-4 py-2.5 text-sm",
          "border-0 outline-none ring-0 focus:outline-none focus:ring-0",
          "max-h-48 text-stone-900 dark:text-stone-100 placeholder:text-stone-400 dark:placeholder:text-stone-500",
          "appearance-none",
          isLoading && "opacity-70",
        )}
      />

      <Button
        type="submit"
        disabled={!canSubmit}
        aria-label="Send"
        className={cn(
          "h-9 w-9 shrink-0 rounded-full p-0 shadow-xs transition-all duration-300",
          canSubmit 
            ? "bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 hover:scale-105 active:scale-[0.95]" 
            : "bg-stone-200/60 dark:bg-stone-800/60 text-stone-450 dark:text-stone-550 cursor-not-allowed opacity-60",
        )}
      >
        {isLoading ? (
          <Loader2 className="animate-spin" size={16} />
        ) : (
          <ArrowUp size={16} />
        )}
        <span className="sr-only">Send</span>
      </Button>
    </form>
  );
}
