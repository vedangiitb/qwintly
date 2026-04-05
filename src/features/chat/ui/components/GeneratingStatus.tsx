import { useGenerate } from "@/features/generate/ui/hooks/useGenerate";
import { useChatContext } from "@/features/chat/ui/hooks/chatContext";
import { useEffect, useRef, useState } from "react";
import { 
  ChevronDown, 
  ChevronUp, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Loader2,
  History
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function GeneratingStatus() {
  const { chatId } = useChatContext();
  const { isGenerating, currentLog, currentStatus, activeChatId, streamGenerationStatus, statusLogs } =
    useGenerate();
  const [isExpanded, setIsExpanded] = useState(false);
  const lastFetchedChatIdRef = useRef<string | null>(null);
  const streamAbortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!isGenerating) {
      streamAbortRef.current?.abort();
      streamAbortRef.current = null;
      lastFetchedChatIdRef.current = null;
      return;
    }

    const resolvedChatId = activeChatId ?? chatId;
    if (!resolvedChatId) return;

    if (lastFetchedChatIdRef.current === resolvedChatId) return;
    lastFetchedChatIdRef.current = resolvedChatId;

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
        lastFetchedChatIdRef.current = null;
      }
      controller.abort();
    };
  }, [isGenerating, activeChatId, chatId, streamGenerationStatus]);

  if (!isGenerating) return null;

  return (
    <div className="mb-4 flex flex-col rounded-2xl border bg-muted/40 overflow-hidden transition-all duration-300 ease-in-out border-primary/20 shadow-sm">
      {/* Header / Main Status */}
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="relative flex h-5 w-5 items-center justify-center">
             <Loader2 className="h-4 w-4 animate-spin text-primary" />
             <div className="absolute inset-0 h-5 w-5 animate-ping rounded-full bg-primary/20" />
          </div>
          
          <div className="flex flex-col">
            <p className="text-sm font-semibold tracking-tight">Generating your site</p>
            <p className="text-xs font-medium bg-linear-to-r from-muted-foreground via-primary to-muted-foreground bg-size-[200%_100%] bg-clip-text text-transparent animate-text-shimmer">
              {currentStatus || (currentLog ? "Working..." : "Setting things up")}
              <span className="animate-typing-dots"></span>
            </p>
          </div>
        </div>

        <button 
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-1.5 rounded-lg border border-primary/10 bg-primary/5 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-primary transition-all hover:bg-primary/10 hover:border-primary/20 active:scale-95"
        >
          <History className="h-3 w-3" />
          {isExpanded ? "Hide Logs" : "View History"}
          {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
        </button>
      </div>

      {/* Expandable History Section */}
      <div 
        className={cn(
          "overflow-hidden transition-all duration-300 ease-in-out bg-muted/20 border-t border-primary/5",
          isExpanded ? "max-h-75 opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <div className="px-4 py-3 space-y-2.5 max-h-72.5 overflow-y-auto scrollbar-hide">
          {statusLogs.length === 0 ? (
            <p className="text-[11px] text-muted-foreground italic text-center py-2">No activity recorded yet...</p>
          ) : (
            statusLogs.map((log, idx) => {
              const isTerminal = log.eventType === "generation_completed" || log.eventType === "generation_failed";
              const isError = log.eventType === "generation_failed" || (log.message?.toLowerCase().includes("failed") ?? false);
              
              return (
                <div key={idx} className="flex gap-3 items-start group">
                  <div className="mt-0.5 relative flex flex-col items-center">
                    {isError ? (
                      <XCircle className="h-3.5 w-3.5 text-destructive shrink-0" />
                    ) : isTerminal ? (
                      <CheckCircle2 className="h-3.5 w-3.5 text-green-500 shrink-0" />
                    ) : (
                      <Clock className="h-3.5 w-3.5 text-primary/60 shrink-0" />
                    )}
                    {idx < statusLogs.length - 1 && (
                      <div className="w-px h-full absolute top-4 bg-primary/10 group-hover:bg-primary/20 transition-colors" />
                    )}
                  </div>
                  
                  <div className="flex flex-col flex-1 pb-2">
                    <div className="flex justify-between items-center whitespace-nowrap">
                      <span className={cn(
                        "text-[11px] font-bold",
                        isError ? "text-destructive" : isTerminal ? "text-green-600" : "text-foreground/80"
                      )}>
                        {log.step || log.eventType.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                      </span>
                      <span className="text-[9px] text-muted-foreground/60 font-mono">
                        {log.createdAt ? new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : ""}
                      </span>
                    </div>
                    {log.message && (
                      <p className="text-[10px] text-muted-foreground leading-relaxed mt-0.5 line-clamp-2 italic">
                        {log.message}
                      </p>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
