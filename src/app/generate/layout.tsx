"use client";
import SideBar from "./components/sidebar/sidebar";
import { useState } from "react";
import { UiProvider } from "./hooks/uiContext";
import { ChatSessionProvider } from "./hooks/chatSessionContext";

export default function GenerateLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [showSidebar, setShowSidebar] = useState(false);
  return (
    <UiProvider>
      <ChatSessionProvider>
        <div className="flex flex-1 overflow-hidden text-foreground">
          <SideBar
            sidebarExpanded={showSidebar}
            setSidebarExpanded={setShowSidebar}
          />
          {children}
        </div>
      </ChatSessionProvider>
    </UiProvider>
  );
}
