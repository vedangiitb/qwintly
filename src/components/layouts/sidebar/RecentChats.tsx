"use client";
import { useChat } from "@/features/chat/ui/hooks/useChat";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef } from "react";

export default function RecentChats({
  isExpanded,
  setSidebarExpanded,
}: {
  isExpanded: boolean;
  setSidebarExpanded: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const {
    recentChats,
    recentChatsCursor,
    hasMoreRecentChats,
    isLoadingRecentChats,
    error,
    loadRecentChats,
    resetActiveChatState,
  } = useChat();
  const router = useRouter();
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isExpanded) return;

    loadRecentChats({ limit: 10 }).catch((err) => {
      console.error("Failed to load recent chats", err);
    });
  }, [isExpanded, loadRecentChats]);

  const maybeLoadMore = useCallback(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    if (isLoadingRecentChats) return;
    if (!hasMoreRecentChats) return;
    if (!recentChatsCursor) return;

    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    if (distanceFromBottom > 80) return;

    void loadRecentChats({ limit: 10, cursor: recentChatsCursor }).catch(
      (err) => {
        console.error("Failed to load more recent chats", err);
      },
    );
  }, [
    hasMoreRecentChats,
    isLoadingRecentChats,
    loadRecentChats,
    recentChatsCursor,
  ]);

  useEffect(() => {
    if (!isExpanded) return;
    if (!recentChats.length) return;

    // If the list doesn't overflow yet, try fetching the next page so the user can scroll.
    maybeLoadMore();
  }, [isExpanded, maybeLoadMore, recentChats.length]);

  if (!isExpanded) return null;

  return (
    <div className="flex flex-col mt-4 border-t pt-4 h-[55vh]">
      <p className="text-xs font-semibold text-chart-2 uppercase tracking-wide mb-2 px-1">
        Recent Chats
      </p>{" "}
      <div
        ref={scrollContainerRef}
        onScroll={maybeLoadMore}
        className="h-[50vh] overflow-y-auto"
      >
        {recentChats.length ? (
          <div className="flex flex-col gap-1 text-sm">
            {recentChats.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  if (
                    typeof window !== "undefined" &&
                    window.innerWidth < 768
                  ) {
                    setSidebarExpanded(false);
                  }
                  resetActiveChatState();
                  router.push(`/generate/${item.id}`);
                }}
                className="text-left px-2 py-2 rounded-md hover:bg-muted transition cursor-pointer overflow-hidden whitespace-nowrap text-ellipsis"
              >
                {item.title}
              </button>
            ))}
            {isLoadingRecentChats ? (
              <p className="text-muted-foreground text-xs px-2 py-2">
                Loading more…
              </p>
            ) : null}
            {error?.toLowerCase().includes("recent chats") ? (
              <p className="text-destructive text-xs px-2 py-2">{error}</p>
            ) : null}
          </div>
        ) : (
          <p className="text-muted-foreground text-xs px-1">
            {error?.toLowerCase().includes("recent chats")
              ? error
              : isLoadingRecentChats
                ? "Loading recent chats…"
                : "Your recent chats will be shown here."}
          </p>
        )}
      </div>
    </div>
  );
}
