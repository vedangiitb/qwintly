"use client";
import { userChats } from "@/app/generate/services/chat/chatService";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface recentChatInterface {
  id: string;
  title: string;
  updated_at: string;
}

export default function RecentChats({ isExpanded }: { isExpanded: boolean }) {
  const [recentChats, setRecentChats] = useState<recentChatInterface[]>([]);
  const router = useRouter();

  useEffect(() => {
    const fetchUserChats = async () => {
      const { chats, error } = await userChats();
      console.log(chats);
      if (!error && chats) setRecentChats(chats);
    };
    fetchUserChats();
  }, []);

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
                console.log("navigating...")
                router.push(`/generate/${item.id}`);
              }}
              className="text-left px-2 py-2 rounded-md hover:bg-muted transition cursor-pointer overflow-hidden whitespace-nowrap text-ellipsis"
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
