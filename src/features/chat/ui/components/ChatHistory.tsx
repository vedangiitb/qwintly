import { useChat } from "../hooks/useChat";
import { useEffect, useLayoutEffect, useRef } from "react";
import { Loader2 } from "lucide-react";
import RenderAIResponse from "./RenderAIResponse";
import RenderUserMessage from "./RenderUserMessage";
import TypingIndicator from "./TypingIndicator";

type ChatHistoryItem = {
  id?: string;
  role: string;
  content: string;
  type?: string;
  msgType?: string;
};

export default function ChatHistory({
  convHistory,
  isResponseLoading,
  isGenerating,
}: {
  convHistory: ChatHistoryItem[];
  isResponseLoading: boolean;
  isGenerating: boolean;
}) {
  const {
    hasMoreMessages,
    isLoadingOlderMessages,
    loadOlderMessages,
  } = useChat();

  const containerRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const firstMessageIdRef = useRef<string | null>(null);
  const prevMessagesLengthRef = useRef<number>(0);
  const lastScrollHeightRef = useRef<number>(0);
  const lastScrollTopRef = useRef<number>(0);

  const firstMessage = convHistory[0];
  const firstMessageId = firstMessage?.id ?? null;

  const lastMessage = convHistory[convHistory.length - 1];
  const lastMessageId = lastMessage?.id ?? null;
  const lastMessageContent = lastMessage?.content ?? "";

  // Stabilize scroll and handle scroll to bottom when messages list updates
  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const prevFirstId = firstMessageIdRef.current;
    const prevLength = prevMessagesLengthRef.current;

    // Case 1: Older messages prepended (lazy load success)
    if (prevFirstId && firstMessageId && prevFirstId !== firstMessageId && convHistory.length > prevLength) {
      const heightDifference = container.scrollHeight - lastScrollHeightRef.current;
      container.scrollTop = lastScrollTopRef.current + heightDifference;
    }
    // Case 2: New message appended or initial load
    else {
      const isInitialLoad = prevLength === 0 && convHistory.length > 0;
      const isNewMessageAtBottom = convHistory.length > prevLength;
      
      // Calculate how close the user is to the bottom
      const isNearBottom = container.scrollHeight - lastScrollTopRef.current - container.clientHeight < 200;
      const isUserSent = lastMessage?.role === "user";

      // Also scroll to bottom if it is currently generating/streaming response to keep the latest words in view
      const isStreaming = isResponseLoading || isGenerating;

      if (isInitialLoad || (isNewMessageAtBottom && (isNearBottom || isUserSent)) || (isStreaming && isNearBottom)) {
        container.scrollTop = container.scrollHeight;
      }
    }

    // Capture values for the next layout pass
    firstMessageIdRef.current = firstMessageId;
    prevMessagesLengthRef.current = convHistory.length;
    lastScrollHeightRef.current = container.scrollHeight;
    lastScrollTopRef.current = container.scrollTop;
  }, [convHistory, lastMessageId, lastMessageContent, isResponseLoading, isGenerating]);

  // Keep scroll position updated on user scrolls
  const handleScroll = () => {
    const container = containerRef.current;
    if (!container) return;
    lastScrollHeightRef.current = container.scrollHeight;
    lastScrollTopRef.current = container.scrollTop;
  };

  // Intersection Observer for Sentinel to trigger lazy loading
  useEffect(() => {
    const sentinel = sentinelRef.current;
    const container = containerRef.current;
    if (!sentinel || !container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first.isIntersecting) {
          if (!isLoadingOlderMessages && hasMoreMessages) {
            void loadOlderMessages().catch((err) => {
              console.error("Failed to load older messages", err);
            });
          }
        }
      },
      {
        root: container,
        threshold: 0,
        rootMargin: "100px 0px 0px 0px", // Trigger when sentinel is within 100px of the viewport top
      }
    );

    observer.observe(sentinel);
    return () => {
      observer.unobserve(sentinel);
    };
  }, [hasMoreMessages, isLoadingOlderMessages, loadOlderMessages]);

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className="flex-1 overflow-y-auto px-2 py-8 space-y-2 custom-scrollbar"
      aria-live="polite"
      tabIndex={0}
      style={{ overflowAnchor: "none" }} // Ensure our manual layout-effect scroll anchoring doesn't conflict with browser defaults
    >
      {/* Sentinel for lazy loading */}
      {hasMoreMessages && <div ref={sentinelRef} className="h-1 w-full -mt-4 opacity-0" />}

      {/* Premium glassmorphic loading spinner */}
      {isLoadingOlderMessages && (
        <div className="flex items-center justify-center py-2 w-full animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-center gap-2.5 bg-stone-100/70 dark:bg-stone-900/70 backdrop-blur-md px-4 py-2 rounded-full border border-stone-200/40 dark:border-stone-800/40 shadow-[0_4px_12px_rgba(0,0,0,0.03)] dark:shadow-[0_4px_12px_rgba(0,0,0,0.15)]">
            <Loader2 className="animate-spin text-teal-600 dark:text-teal-400" size={14} />
            <span className="text-xs text-stone-600 dark:text-stone-300 font-medium tracking-wide">
              Loading older messages...
            </span>
          </div>
        </div>
      )}

      {convHistory.length > 0 &&
        convHistory.map((item, idx) => (
          <div key={item.id ?? idx} className="animate-in fade-in duration-300">
            {item.role === "user" ? (
              <RenderUserMessage data={item.content} messageType={item.type} />
            ) : (
              <RenderAIResponse
                data={item.content}
                msgType={item.type ?? item.msgType ?? "message"}
                messageId={item.id}
              />
            )}
          </div>
        ))}
      {isResponseLoading && <TypingIndicator isGenerating={isGenerating} />}
    </div>
  );
}
