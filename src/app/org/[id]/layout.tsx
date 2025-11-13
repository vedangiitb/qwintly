"use client";
import OrgSidebar from "@/components/layouts/orgSidebar/sidebar";
import { useState } from "react";

export default function GenerateLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [showSidebar, setShowSidebar] = useState(false);

  return (
    <div className="flex flex-1 w-full overflow-hidden text-foreground">
      <OrgSidebar
        sidebarExpanded={showSidebar}
        setSidebarExpanded={setShowSidebar}
      />
      <div className="px-4 md:px-32 py-8 w-full">{children}</div>
    </div>
  );
}
