"use client";
import { useChat } from "@/app/generate/hooks/chat/useChat";
import { useRouter } from "next/navigation";

export default function RecentChats({
  isExpanded,
  setSidebarExpanded,
}: {
  isExpanded: boolean;
  setSidebarExpanded: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const { recentChats } = useChat();
  const router = useRouter();

  if (!isExpanded) return null;

  return (
    <div className="flex flex-col mt-4 border-t pt-4 h-[50vh] overflow-y-auto custom-scrollbar">
      <p className="text-xs font-semibold text-chart-2 uppercase tracking-wide mb-2 px-1">
        Recent Chats
      </p>{" "}
      {recentChats.length ? (
        <div className="flex flex-col gap-1 text-sm">
          {recentChats.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                if (typeof window !== "undefined" && window.innerWidth < 768) {
                  setSidebarExpanded(false);
                }
                router.push(`/generate/${item.id}`);
              }}
              className="text-left border border-border/60 hover:border-indigo-400/40 hover:shadow-sm px-2 py-2 rounded-md hover:bg-muted/30 transition cursor-pointer overflow-hidden whitespace-nowrap text-ellipsis"
            >
              {item.title}
            </button>
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground text-xs px-1">
          Your recent chats will be shown here.
        </p>
      )}
    </div>
  );
}
