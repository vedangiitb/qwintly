"use client";
import { LogIn } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/app/login/hooks/AuthContext";
import { Button } from "@/components/ui/button";
import SidebarToggle from "../sidebar/SidebarToggle";
import { SetStateAction } from "react";

export default function NavBar({
  showSidebar,
  setShowSidebar,
}: {
  showSidebar: boolean;
  setShowSidebar: React.Dispatch<SetStateAction<boolean>>;
}) {
  const user = useAuth();

  return (
    <div>
      <header className="sticky top-0 z-20 flex items-center justify-between px-4 py-2 md:px-8 md:py-4">
        <div className="flex items-center gap-3 justify-center">
          <div className={`${showSidebar ? "hidden" : ""} md:hidden`}>
            <SidebarToggle
              isExpanded={showSidebar}
              onToggle={() => setShowSidebar(!showSidebar)}
            />
          </div>
          <div className={`${showSidebar ? "hidden" : ""}`}>
            <span className="font-extrabold text-lg tracking-wider text-transparent bg-gradient-to-tr dark:from-teal-200 dark:via-purple-300 dark:to-pink-400 from-teal-600 via-purple-600 to-pink-600 bg-clip-text drop-shadow select-none ml-2 transition">
              Qwintly
            </span>
          </div>
        </div>

        <div className="flex items-center gap-8">
          {user.currentUser === "Login" ? (
            <>
              <Link href="/login">
                <Button
                  variant="ghost"
                  className="dark:text-white dark:hover:text-blue-200 hover:bg-blue-50 cursor-pointer text-black hover:text-blue-700 "
                >
                  <LogIn className="w-4 h-4 mr-2" />
                  Sign In
                </Button>
              </Link>
              <Link href="/login">
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300  cursor-pointer">
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
