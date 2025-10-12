"use client";
import DarkMode from "./DarkMode";
import NavItems from "./NavItems";
import SidebarToggle from "./SidebarToggle";
import UserPopover from "./UserPopover";

export default function SideBar({
  sidebarExpanded,
  setSidebarExpanded,
}: {
  sidebarExpanded: boolean;
  setSidebarExpanded: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  return (
    <aside
      className={`${sidebarExpanded ? "flex" : "hidden"} md:flex border-r flex-col justify-between h-screen transition-all duration-300 ease-in-out z-30 
         ${
           sidebarExpanded
             ? "fixed w-full md:w-64 p-3  bg-card/95 "
             : "w-16 p-2 bg-background/80"
         }
      `}
    >
      <div className="flex flex-col gap-5">
        <SidebarToggle
          isExpanded={sidebarExpanded}
          onToggle={() => setSidebarExpanded(!sidebarExpanded)}
        />

        <div>
          <NavItems isExpanded={sidebarExpanded} />
        </div>

        {/* <RecentChats isExpanded={isExpanded} /> */}
      </div>
      <div className="space-y-2 pt-2">
        <DarkMode isExpanded={sidebarExpanded} />
        <UserPopover isExpanded={sidebarExpanded} />
      </div>
    </aside>
  );
}
