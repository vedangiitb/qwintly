"use client";
import { useAuth } from "@/features/auth/ui/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { LogIn } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import DarkMode from "./DarkMode";
import UserPopover from "./UserPopover";

export default function NavBar() {
  const { currentUser, loading } = useAuth();
  const router = useRouter();

  return (
    <div className="w-full px-4 pt-3 pb-1 shrink-0">
      <header className="z-20 flex items-center justify-end md:justify-between py-2 px-6 backdrop-blur-lg bg-white/35 dark:bg-stone-900/35 border border-stone-200/40 dark:border-stone-800/40 rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.01)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.08)]">
        <div 
          className="md:flex hidden items-center gap-2 cursor-pointer group" 
          onClick={() => router.push("/")}
        >
          <span className="font-semibold text-lg tracking-tight text-transparent bg-gradient-to-r dark:from-teal-300 dark:via-purple-400 dark:to-pink-400 from-teal-700 via-purple-700 to-pink-700 bg-clip-text select-none transition-all duration-300 group-hover:brightness-110">
            Qwintly
          </span>
          <div className="h-1.5 w-1.5 rounded-full bg-teal-500 animate-pulse" />
        </div>

        <div className="flex items-center gap-4">
          <div className="flex gap-1.5 items-center">
            <DarkMode />
            <UserPopover />
          </div>

          {!loading && !currentUser ? (
            <div className="flex items-center gap-2">
              <Link href="/login">
                <Button
                  variant="ghost"
                  className="text-stone-600 dark:text-stone-300 hover:text-stone-950 dark:hover:text-white hover:bg-stone-900/5 dark:hover:bg-white/5 cursor-pointer rounded-full h-9 px-4 transition-all"
                >
                  <LogIn className="w-3.5 h-3.5 mr-1.5" />
                  Sign In
                </Button>
              </Link>
              <Link href="/login">
                <Button className="bg-stone-900 dark:bg-stone-50 text-white dark:text-stone-950 hover:bg-stone-800 dark:hover:bg-stone-200 shadow-sm active:scale-[0.97] transition-all duration-300 cursor-pointer rounded-full h-9 px-5 font-medium">
                  Get Started
                </Button>
              </Link>
            </div>
          ) : null}
        </div>
      </header>
    </div>
  );
}
