"use client";
import DarkMode from "./DarkMode";
import NavItems from "./NavItems";
import ProjectList from "./ProjectList";
import RecentChats from "./RecentChats";
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
    <div>
      <aside
        className={`fixed md:static left-0 top-0 transform transition-all duration-300 ease-in-out z-30 border-r flex flex-col justify-between h-full
         ${sidebarExpanded ? "translate-x-0 w-full md:w-64 px-2 bg-card/95" : "-translate-x-full md:translate-x-0 md:w-16 p-2 bg-background/80"}
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
          <RecentChats
            isExpanded={sidebarExpanded}
            setSidebarExpanded={setSidebarExpanded}
          />
        </div>
        <div className="space-y-2 py-1">
          <ProjectList isExpanded={sidebarExpanded} />
        </div>
      </aside>

      {!sidebarExpanded && (
        <div className="fixed top-2 left-2 md:hidden z-30">
          <SidebarToggle
            isExpanded={sidebarExpanded}
            onToggle={() => setSidebarExpanded(!sidebarExpanded)}
          />
        </div>
      )}
    </div>
  );
}
