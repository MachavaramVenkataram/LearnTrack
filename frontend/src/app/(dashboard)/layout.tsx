"use client";

import React, { useState } from "react";
import { DashboardSidebar } from "@/components/layout/DashboardSidebar";
import { DashboardTopNav } from "@/components/layout/DashboardTopNav";

import { GlobalAILauncher } from "@/components/layout/GlobalAILauncher";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen flex bg-slate-50/50">
      {/* Sidebar Navigation */}
      <DashboardSidebar
        isMobileOpen={isMobileSidebarOpen}
        onMobileClose={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <DashboardTopNav onMenuClick={() => setIsMobileSidebarOpen(true)} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1580px] w-full mx-auto">
          {children}
        </main>
      </div>

      {/* Floating AI Command Launcher (Section 33) */}
      <GlobalAILauncher />
    </div>
  );
}

