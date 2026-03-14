"use client";
import { useState } from "react";
import SideBar from "@/components/layouts/sidebar/sidebar";
import { GenerateUiProvider } from "@/features/generate/ui/hooks/generateUiContext";

export default function GenerateLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [showSidebar, setShowSidebar] = useState(false);
  return (
    <GenerateUiProvider>
      <div className="flex flex-1 overflow-hidden text-foreground">
        <SideBar
          sidebarExpanded={showSidebar}
          setSidebarExpanded={setShowSidebar}
        />
        {children}
      </div>
    </GenerateUiProvider>
  );
}
