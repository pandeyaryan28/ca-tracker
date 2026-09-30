import React from 'react';
import {
  LayoutDashboard,
  CheckSquare,
  Calendar,
  RotateCw,
  FolderSync,
} from 'lucide-react';
import { NavigationTab } from '@/types';
import { cn } from '@/lib/utils';

interface BottomDockProps {
  activeTab: NavigationTab;
  onTabChange: (tab: NavigationTab) => void;
  className?: string;
}

export const BottomDock: React.FC<BottomDockProps> = ({
  activeTab,
  onTabChange,
  className,
}) => {
  const dockItems = [
    { id: 'dashboard' as NavigationTab, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'checklist' as NavigationTab, label: 'Checklist', icon: CheckSquare },
    { id: 'schedule' as NavigationTab, label: 'Schedule', icon: Calendar },
    { id: 'revisions' as NavigationTab, label: 'Revisions', icon: RotateCw },
    { id: 'ingestion' as NavigationTab, label: 'Ingestion', icon: FolderSync },
  ];

  return (
    <div
      className={cn(
        'lg:hidden fixed bottom-0 inset-x-0 z-40 p-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] select-none pointer-events-none',
        className
      )}
    >
      <nav
        aria-label="Mobile Navigation Dock"
        className="pointer-events-auto max-w-md mx-auto h-16 rounded-2xl glass-dock shadow-xl px-2 flex items-center justify-around border border-zinc-200/90 dark:border-zinc-800/90"
      >
        {dockItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onTabChange(item.id)}
              className={cn(
                'flex flex-col items-center justify-center flex-1 h-12 rounded-xl transition-all duration-150 active:scale-90 touch-target relative min-h-[44px] min-w-[44px]',
                isActive
                  ? 'text-zinc-950 dark:text-white font-semibold'
                  : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200'
              )}
              aria-current={isActive ? 'page' : undefined}
            >
              {isActive && (
                <span className="absolute -top-1 w-8 h-1 bg-zinc-900 dark:bg-zinc-100 rounded-sm" />
              )}
              <Icon
                className={cn(
                  'w-5 h-5 transition-transform duration-200',
                  isActive ? 'scale-110' : 'scale-100'
                )}
              />
              <span className="text-[10px] tracking-tight mt-0.5">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};
