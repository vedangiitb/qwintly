"use client";
import { useState } from "react";
import SideBar from "./components/sidebar/sidebar";
import { UiProvider } from "./hooks/uiContext";

export default function GenerateLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [showSidebar, setShowSidebar] = useState(false);
  return (
    <UiProvider>
      <div className="flex flex-1 overflow-hidden text-foreground">
        <SideBar
          sidebarExpanded={showSidebar}
          setSidebarExpanded={setShowSidebar}
        />
        {children}
      </div>
    </UiProvider>
  );
}
