import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowUp, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils"; // assuming you use classNames utility

export default function ChatBox({
  prompt,
  submitPrompt,
  setPrompt,
  isResponseLoading,
}: {
  prompt: string;
  submitPrompt: any;
  setPrompt: React.Dispatch<React.SetStateAction<string>>;
  isResponseLoading: boolean;
}) {
  return (
    <form
      className="fixed bottom-2 flex w-full max-w-3xl rounded-3xl glassmorphic shadow-2xl border p-3 md:p-4 mx-auto backdrop-blur-2xl transition-all duration-200"
      onSubmit={()=>submitPrompt()}
      style={{
        background:
          "linear-gradient(110deg, rgba(255,255,255,0.16) 55%, rgba(195,189,255,0.10) 100%)",
        boxShadow:
          "0 8px 48px 0 rgba(109,231,225,0.10), 0 1.5px 4px 0 rgba(80,68,204,0.08)",
      }}
    >
      <Textarea
        className={cn(
          "text-vsm rounded-2xl border-none outline-none focus:outline-none resize-none flex-1 text-accent-foreground shadow-none  bg-accent p-3 md:p-4 max-h-16 md:min-h-[48px] md:max-h-48 transition-all duration-200 focus:ring-2 focus:ring-teal-200/50 focus:bg-white/10 backdrop-blur-sm",
          isResponseLoading ? "opacity-60 pointer-events-none" : "opacity-100"
        )}
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            submitPrompt(e);
          }
        }}
        // TODO: Make this changing
        placeholder="An AI tutor for learning Data Structures…"
        aria-label="Prompt"
        disabled={isResponseLoading}
        style={{
          backgroundColor: "var(--accent)",
        }}
      />
      <Button
        type="submit"
        disabled={isResponseLoading || !prompt}
        aria-label="Submit prompt"
        className={cn(
          "ml-2 rounded-full bg-gradient-to-br dark:from-teal-400/90 dark:via-purple-500/90 dark:to-cyan-400/70 from-teal-600 via-purple-600 to-cyan-600 shadow-xl w-12 h-12 flex items-center justify-center p-0 transition-all duration-150 relative group disabled:opacity-80",
          isResponseLoading
            ? "cursor-not-allowed animate-pulse"
            : "hover:scale-105 hover:shadow-2xl hover:bg-gradient-to-br dark:from-cyan-300/60 dark:via-fuchsia-400/80 dark:to-purple-500/80"
        )}
        tabIndex={0}
      >
        {isResponseLoading ? (
          <Loader2 className="animate-spin text-white" size={22} />
        ) : (
          <ArrowUp
            size={21}
            className="text-white group-hover:scale-125 transition duration-200"
          />
        )}
        <span className="sr-only">Send</span>
        <span className="absolute -inset-1.5 opacity-0 group-focus-within:opacity-80 rounded-full bg-gradient-to-tr from-purple-400/60 via-teal-200/40 to-cyan-200/30 blur-xl pointer-events-none transition-opacity"></span>
      </Button>
      <style jsx>{`
        .glassmorphic {
          box-shadow:
            0 8px 48px 0 rgba(109, 231, 225, 0.1),
            0 1.5px 4px 0 rgba(80, 68, 204, 0.08);
          backdrop-filter: blur(24px) saturate(180%);
        }
      `}</style>
    </form>
  );
}
