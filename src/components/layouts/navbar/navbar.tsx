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
    <div>
      <header className="sticky top-0 z-20 flex items-center justify-end md:justify-between py-1.5 px-4 backdrop-blur-md bg-background/80 border-b border-border/40">
        <div className={`md:block hidden`} onClick={() => router.push("/")}>
          <span className="cursor-pointer font-medium text-base tracking-wider text-transparent bg-linear-to-tr dark:from-teal-300 dark:via-purple-400 dark:to-pink-400 from-teal-600 via-purple-600 to-pink-600 bg-clip-text select-none ml-2 transition-opacity hover:opacity-80">
            Qwintly
          </span>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex gap-2 items-center">
            <DarkMode />

            <UserPopover />
          </div>

          {!loading && !currentUser ? (
            <>
              <Link href="/login">
                <Button
                  variant="ghost"
                  className="text-muted-foreground hover:text-foreground hover:bg-accent/50 cursor-pointer"
                >
                  <LogIn className="w-4 h-4 mr-2" />
                  Sign In
                </Button>
              </Link>
              <Link href="/login">
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm transition-all duration-300 cursor-pointer rounded-full px-5">
                  Get Started
                </Button>
              </Link>
            </>
          ) : null}
        </div>
      </header>
    </div>
  );
}


