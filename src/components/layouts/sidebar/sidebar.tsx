"use client";
import { useState } from "react";
import DarkMode from "./DarkMode";
import UserPopover from "./UserPopover";

export default function Sidebar() {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <aside
      className={`border-r flex flex-col justify-between h-screen transition-all duration-300 ease-in-out z-30 
         ${
           isExpanded
             ? "w-64 sm:w-72 p-3 bg-card/80"
             : "w-16 p-2 bg-background/80"
         }
      `}
    >
      {/* <div className="flex flex-col gap-5">
        <SidebarToggle
          isExpanded={isExpanded}
          onToggle={() => setIsExpanded(!isExpanded)}
        />

        <div>
          <NavItems isExpanded={isExpanded} />
        </div>

        <RecentChats isExpanded={isExpanded} />
      </div> */}
      <div className="space-y-2 pt-2">
        <DarkMode isExpanded={isExpanded} />
        <UserPopover isExpanded={isExpanded} />
      </div>
    </aside>
  );
}
