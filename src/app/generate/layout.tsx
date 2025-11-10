"use client";
import SideBar from "@/components/layouts/sidebar/sidebar";
import { useState } from "react";

export default function GenerateLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [showSidebar, setShowSidebar] = useState(false);
  return (
    <div className="flex flex-1 overflow-hidden text-foreground">
      <SideBar
        sidebarExpanded={showSidebar}
        setSidebarExpanded={setShowSidebar}
      />
      {children}
    </div>
  );
}
