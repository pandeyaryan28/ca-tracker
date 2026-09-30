import React, { useState } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { BottomDock } from '@/components/layout/BottomDock';
import { MobileNavDrawer } from '@/components/layout/MobileNavDrawer';
import { NavigationTab } from '@/types';
import { cn } from '@/lib/utils';

interface AppShellProps {
  activeTab: NavigationTab;
  onTabChange: (tab: NavigationTab) => void;
  children: React.ReactNode;
  className?: string;
}

export const AppShell: React.FC<AppShellProps> = ({
  activeTab,
  onTabChange,
  children,
  className,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 flex flex-row overflow-x-hidden antialiased selection:bg-zinc-800 selection:text-white dark:selection:bg-zinc-200 dark:selection:text-zinc-900">
      {/* Desktop Left Sidebar (>=1024px) */}
      <Sidebar activeTab={activeTab} onTabChange={onTabChange} />

      {/* Main Column */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        {/* Top Header */}
        <Header activeTab={activeTab} onOpenMobileMenu={() => setIsMobileMenuOpen(true)} />

        {/* Dynamic View Body */}
        <main
          className={cn(
            'flex-1 p-3 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto pb-28 lg:pb-12 animate-fade-in',
            className
          )}
        >
          {children}
        </main>

        {/* Mobile Bottom Dock (<1024px) */}
        <BottomDock activeTab={activeTab} onTabChange={onTabChange} />

        {/* Mobile Slide-Out Drawer (<1024px) */}
        <MobileNavDrawer
          isOpen={isMobileMenuOpen}
          onClose={() => setIsMobileMenuOpen(false)}
          activeTab={activeTab}
          onTabChange={onTabChange}
        />
      </div>
    </div>
  );
};
