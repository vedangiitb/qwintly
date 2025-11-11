"use client";
import NavItems from "./NavItems";
import OrgList from "./OrgList";
import ProjectList from "./ProjectList";
import RecentChats from "./RecentChats";
import SidebarToggle from "./SidebarToggle";

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
        className={`fixed md:static bg-background left-0 top-0 transform transition-all duration-300 ease-in-out z-30 border-r flex flex-col justify-between h-full p-2
         ${sidebarExpanded ? "translate-x-0 w-full md:w-64" : "-translate-x-full md:translate-x-0 md:w-14"}
      `}
      >
        <div className="flex flex-col gap-2">
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
          <OrgList isExpanded={sidebarExpanded} />
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
