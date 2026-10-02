'use client';

import * as React from 'react';
import { AppSidebar } from '@/components/layout/sidebar';
import { AppHeader } from '@/components/layout/header';
import { useConfigStore } from '@/store/useConfigStore';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = React.useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = React.useState(false);
  const { isDarkMode } = useConfigStore();

  // Sync dark mode class on mount
  React.useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground">
      {/* Sidebar-07 (Fixed frame with scrollable inner menu) */}
      <AppSidebar
        isMobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
        isCollapsed={isSidebarCollapsed}
      />

      {/* Main View Area */}
      <div className="flex flex-1 flex-col h-screen overflow-hidden min-w-0">
        <AppHeader
          onOpenMobile={() => setMobileSidebarOpen(true)}
          isSidebarCollapsed={isSidebarCollapsed}
          onToggleSidebar={() => setIsSidebarCollapsed((prev) => !prev)}
        />

        {/* Outer Main Content: 100% FIXED, NO SCROLL Y (Hapus Scroll Y - jadikan Ukuran Fixing) */}
        <main className="flex-1 min-h-0 h-[calc(100vh-4rem)] max-h-[calc(100vh-4rem)] overflow-hidden min-w-0 flex flex-col">
          {/* Inner Main Content: SCROLLS Y (main Content Dalam dapat diScroll) */}
          <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 pb-16 [scrollbar-width:thin] [scrollbar-color:#ff810a_transparent] animate-in fade-in duration-200">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
