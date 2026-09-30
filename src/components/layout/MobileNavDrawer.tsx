import React, { useEffect } from 'react';
import {
  LayoutDashboard,
  Calendar,
  CheckSquare,
  Film,
  FileSpreadsheet,
  RotateCw,
  FolderSync,
  Settings,
  X,
  GraduationCap,
  Cloud,
  RefreshCw,
} from 'lucide-react';
import { NavigationTab } from '@/types';
import { useData } from '@/context/DataContext';
import { ProgressBar } from '@/components/common/ProgressBar';
import { ThemeToggle } from '@/components/common/ThemeToggle';
import { cn } from '@/lib/utils';

interface MobileNavDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: NavigationTab;
  onTabChange: (tab: NavigationTab) => void;
}

export const MobileNavDrawer: React.FC<MobileNavDrawerProps> = ({
  isOpen,
  onClose,
  activeTab,
  onTabChange,
}) => {
  const { metrics, subjectGroups, isSyncing, isCloudConnected } = useData();

  // Close drawer on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const navItems = [
    { id: 'dashboard' as NavigationTab, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'schedule' as NavigationTab, label: 'Study Schedule', icon: Calendar },
    { id: 'checklist' as NavigationTab, label: 'Syllabus Checklist', icon: CheckSquare },
    { id: 'lectures' as NavigationTab, label: 'Video Lectures', icon: Film },
    { id: 'tests' as NavigationTab, label: 'Test Series & Marks', icon: FileSpreadsheet },
    { id: 'revisions' as NavigationTab, label: 'Spaced Revisions', icon: RotateCw },
    { id: 'ingestion' as NavigationTab, label: 'Ingestion & Backup Hub', icon: FolderSync },
    { id: 'settings' as NavigationTab, label: 'Preferences & Settings', icon: Settings },
  ];

  const handleSelectTab = (tab: NavigationTab) => {
    onTabChange(tab);
    onClose();
  };

  return (
    <div
      className="lg:hidden fixed inset-0 z-50 flex animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-label="Mobile Navigation Menu"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer Panel */}
      <div className="relative w-72 max-w-[85vw] h-full bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 shadow-2xl flex flex-col justify-between z-10 overflow-y-auto animate-scale-in">
        {/* Top Header */}
        <div>
          <div className="h-16 flex items-center justify-between px-4 border-b border-zinc-200/80 dark:border-zinc-800/80 pt-safe">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-zinc-900 dark:bg-zinc-100 flex items-center justify-center text-zinc-100 dark:text-zinc-900 shadow-sm shrink-0">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-sm tracking-tight text-zinc-900 dark:text-zinc-50">
                  CA Tracker
                </span>
                <span className="text-[10px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  Foundation Command Center
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="touch-target p-2 rounded-xl text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              aria-label="Close Mobile Navigation Menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Items */}
          <nav className="p-3 space-y-1" aria-label="Mobile Drawer Navigation">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleSelectTab(item.id)}
                  className={cn(
                    'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-all duration-150 touch-target min-h-[44px]',
                    isActive
                      ? 'bg-zinc-900 text-zinc-50 dark:bg-zinc-100 dark:text-zinc-900 shadow-sm'
                      : 'text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800/60'
                  )}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <Icon
                    className={cn(
                      'w-5 h-5 shrink-0',
                      isActive ? 'text-current' : 'text-zinc-500 dark:text-zinc-400'
                    )}
                  />
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Section: Progress & Sync Status */}
        <div className="p-4 m-3 rounded-2xl bg-zinc-100/70 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-700/80 space-y-3 pb-safe">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-zinc-700 dark:text-zinc-300">
              Syllabus Completion
            </span>
            <span className="font-bold text-zinc-900 dark:text-zinc-100 tabular-nums">
              {metrics.overallProgressPercentage}%
            </span>
          </div>

          <ProgressBar value={metrics.overallProgressPercentage} size="sm" />

          {/* 4 Mini Subject Progress Cards */}
          <div className="grid grid-cols-4 gap-1.5 pt-1">
            {(['paper1', 'paper2', 'paper3', 'paper4'] as const).map((pId) => {
              const group = subjectGroups[pId];
              const pct = group ? group.progressPercentage : 0;
              return (
                <div
                  key={pId}
                  className="flex flex-col items-center p-1 rounded-lg bg-white/80 dark:bg-zinc-900/80 border border-zinc-200/60 dark:border-zinc-700/60 text-center"
                >
                  <span className="text-[9px] font-bold uppercase text-zinc-500 dark:text-zinc-400">
                    {group?.meta.code || pId}
                  </span>
                  <span className="text-[10px] font-bold text-zinc-800 dark:text-zinc-200 tabular-nums">
                    {pct}%
                  </span>
                </div>
              );
            })}
          </div>

          {/* Cloud Sync & Theme Bar */}
          <div className="flex items-center justify-between pt-2 border-t border-zinc-200/60 dark:border-zinc-700/60 text-xs">
            <div className="flex items-center gap-1.5 text-zinc-600 dark:text-zinc-400">
              {isSyncing ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-500" />
              ) : (
                <Cloud
                  className={cn(
                    'w-3.5 h-3.5',
                    isCloudConnected ? 'text-emerald-500' : 'text-zinc-400'
                  )}
                />
              )}
              <span className="text-[11px] font-medium">
                {isSyncing ? 'Syncing...' : isCloudConnected ? 'Cloud Synced' : 'Offline'}
              </span>
            </div>

            <ThemeToggle />
          </div>
        </div>
      </div>
    </div>
  );
};
