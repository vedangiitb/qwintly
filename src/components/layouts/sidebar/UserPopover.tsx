"use client";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { CircleUser, HelpCircle, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/login/hooks/AuthContext";
import PrefDialog from "./prefDialog";
import SettingsDialog from "./settingsDialog";

export default function UserPopover({ isExpanded }: { isExpanded: boolean }) {
  const router = useRouter();
  const { currentUser, logout } = useAuth();

  if (currentUser === "Login") return null;

  const fallback = String(currentUser?.[0] || "").toUpperCase();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <div
          className={`flex gap-3 items-center group rounded-xl cursor-pointer mt-1 transition min-h-10
            ${isExpanded ? "border py-1 px-1" : "justify-center w-11 p-0"}
            hover:bg-accent hover:backdrop-blur-sm hover:shadow focus:outline-none`}
        >
          <span className="relative inline-block">
            <Avatar className="w-9 h-9 shadow-lg">
              <span className="absolute -inset-1 left-1/2 -translate-x-1/2 w-[44px] h-[44px] rounded-full bg-gradient-to-tr from-teal-400/60 via-purple-300/30 to-pink-200/40 blur-md opacity-60 group-hover:opacity-80 group-hover:blur-xl transition-all pointer-events-none" />
              <AvatarFallback className="bg-gradient-to-tr from-teal-400/90 via-purple-500/90 to-cyan-400/70 text-white font-bold ring-1 ring-white/10 shadow">
                {fallback}
              </AvatarFallback>
            </Avatar>
          </span>
          {isExpanded && (
            <span className="font-medium tracking-tight text-base text-foreground/80 transition select-none truncate">
              {currentUser}
            </span>
          )}
        </div>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        sideOffset={7}
        className="ml-2 p-4 rounded-3xl shadow-2xl border border-white/10 glass-popover min-w-[230px] bg-white/20 backdrop-blur-xl"
      >
        <div className="flex items-center gap-2 text-foreground pb-2 mb-2 border-b border-white/10">
          <CircleUser className="h-4 w-4 text-chart-2" />
          <p className="text-[15px] font-semibold truncate">{currentUser}</p>
        </div>
        <div className="flex flex-col gap-1 text-foreground/90 mb-2">
          <PrefDialog />
          <SettingsDialog />
        </div>
        <div className="pt-2 flex flex-col gap-1 text-foreground/80 border-t border-white/5">
          <button
            className="flex items-center gap-2 px-2 py-2 rounded-lg bg-transparent hover:bg-border transition-colors cursor-pointer duration-200 group"
            tabIndex={0}
            aria-label="Help"
            type="button"
          >
            <HelpCircle className="h-4 w-4 mr-1" />
            <span className="text-[14px]">Help</span>
          </button>
          <button
            className="flex items-center gap-2 px-2 py-2 rounded-lg bg-transparent hover:bg-pink-400/10 hover:text-pink-400 transition-colors duration-200 group"
            tabIndex={0}
            aria-label="Logout"
            type="button"
            onClick={() => {
              logout();
              router.push("/");
            }}
          >
            <LogOut className="h-4 w-4 mr-1 text-slate-400 group-hover:text-pink-400" />
            <span className="text-[14px] font-semibold">Logout</span>
          </button>
        </div>
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
