"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/services/authServices/AuthContext";

interface recentChatInterface {
  chatId: string;
  chatName: string;
}

export default function RecentChats({ isExpanded }: { isExpanded: boolean }) {
  const [recentChats, setRecentChats] = useState<recentChatInterface[]>([]);
  const user = useAuth();
  const router = useRouter();

  useEffect(() => {
    const getRecentChats = async () => {
      if (!user?.userId) return;
      try {
        const { data } = await supabase
          .from("user_conversations")
          .select("id, name")
          .eq("user_id", user.userId)
          .order("created_at", { ascending: false })
          .throwOnError();
        if (data) {
          setRecentChats(
            data.map(({ id, name }) => ({ chatId: id, chatName: name }))
          );
        }
      } catch (error) {
        console.error("Failed to fetch recent chats:", error);
      }
    };

    getRecentChats();
  }, [user]);

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
              key={item.chatId}
              onClick={() => router.push(`/generate?id=${item.chatId}`)}
              className="text-left px-2 py-2 rounded-md hover:bg-muted transition cursor-pointer overflow-hidden whitespace-nowrap text-ellipsis"
            >
              {item.chatName}
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
