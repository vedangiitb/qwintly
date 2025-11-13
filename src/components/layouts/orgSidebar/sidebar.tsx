"use client";
import OrgBilling from "./orgBilling";
import OrgMembers from "./orgMembers";
import OrgSettings from "./orgSettings";
import ProjectSidebarIcon from "./Projects";
import SidebarToggle from "./SidebarToggle";

export default function OrgSidebar({
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
          <ProjectSidebarIcon isExpanded={sidebarExpanded} isActive={true} />
          <OrgSettings isExpanded={sidebarExpanded} isActive={false} />
          <OrgMembers isExpanded={sidebarExpanded} isActive={false} />
          <OrgBilling isExpanded={sidebarExpanded} isActive={false} />
          {/* <OrgList isExpanded={sidebarExpanded} /> */}
          {/* <ProjectList isExpanded={sidebarExpanded} /> */}
        </div>
        <div className="space-y-2 py-1">
          <SidebarToggle
            isExpanded={sidebarExpanded}
            onToggle={() => setSidebarExpanded(!sidebarExpanded)}
          />
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
