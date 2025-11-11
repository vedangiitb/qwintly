"use client";
import { useAuth } from "@/app/login/hooks/AuthContext";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CircleUser, FolderKanban, HelpCircle, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import PrefDialog from "../navbar/prefDialog";
import SettingsDialog from "../navbar/settingsDialog";
import { Button } from "@/components/ui/button";
export default function ProjectList({ isExpanded }: { isExpanded: boolean }) {
  const router = useRouter();
  const { currentUser, logout } = useAuth();

  if (currentUser === "Login") return null;

  const fallback = String(currentUser?.[0] || "").toUpperCase();
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          // onClick={}
          className={`
    flex items-center justify-center
   h-9 rounded-lg  shadow-sm
     hover:bg-muted hover:shadow-md
    transition-all duration-200
    ${!isExpanded ? "justify-center w-9" : "justify-start w-full gap-2 px-2"}
        `}
          tabIndex={0}
        >
          <span>
            <FolderKanban className="w-4 h-4 text-muted-foreground hover:text-foreground transition-colors"></FolderKanban>
          </span>
          {isExpanded ? (
            <span className="text-sm font-medium ml-2 select-none">
              Projects
            </span>
          ) : null}
          <span
            className={`absolute left-0 right-0 mx-auto w-3 h-3 rounded-full pointer-events-none blur opacity-70 animate-pulse`}
          ></span>
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        sideOffset={7}
        className="ml-2 p-4 rounded-3xl shadow-2xl border border-white/10 glass-popover min-w-[230px] bg-white/20 backdrop-blur-xl"
      >
        <p>Your Projects</p>
        <Button variant="link">All Projects</Button>

        {/* Glass effect styling */}
        <style jsx>{`
          .glass-popover {
            background: linear-gradient(
              120deg,
              rgba(102, 255, 230, 0.12),
              rgba(195, 189, 255, 0.13) 70%
            );
            backdrop-filter: blur(24px) saturate(180%);
            box-shadow: 0 12px 60px rgba(80, 68, 204, 0.09);
          }
        `}</style>
      </PopoverContent>
    </Popover>
  );
}
