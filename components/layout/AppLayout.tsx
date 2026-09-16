"use client";

import React, { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { UserSession } from "@/types";

interface AppLayoutProps {
  user: UserSession;
  children: React.ReactNode;
}

export function AppLayout({ user, children }: AppLayoutProps) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Sticky Header Navbar */}
      <Navbar
        user={user}
        onToggleMobileSidebar={() => setMobileSidebarOpen(!mobileSidebarOpen)}
      />

      {/* Main Container ยืดความสูงให้เต็มจอภาพด้านล่าง Navbar */}
      <div className="flex flex-1 min-h-[calc(100vh-4rem)] relative">
        {/* Sidebar ยืดเต็มความสูงเสมอ */}
        <Sidebar
          user={user}
          mobileOpen={mobileSidebarOpen}
          onCloseMobile={() => setMobileSidebarOpen(false)}
        />

        {/* Main Application Content Area */}
        <main className="flex-1 p-6 lg:p-8 max-w-7xl mx-auto w-full overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
