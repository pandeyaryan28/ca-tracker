import React, { useState } from 'react';
import {
  LayoutDashboard,
  Calendar,
  CheckSquare,
  Film,
  FileSpreadsheet,
  RotateCw,
  FolderSync,
  Settings,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
} from 'lucide-react';
import { NavigationTab } from '@/types';
import { useData } from '@/context/DataContext';
import { ProgressBar } from '@/components/common/ProgressBar';
import { cn } from '@/lib/utils';

interface SidebarProps {
  activeTab: NavigationTab;
  onTabChange: (tab: NavigationTab) => void;
  className?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  className,
}) => {
  const [collapsed, setCollapsed] = useState(false);
  const { metrics, subjectGroups } = useData();

  const navItems = [
    { id: 'dashboard' as NavigationTab, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'schedule' as NavigationTab, label: 'Schedule', icon: Calendar },
    { id: 'checklist' as NavigationTab, label: 'Checklist', icon: CheckSquare },
    { id: 'lectures' as NavigationTab, label: 'Lectures', icon: Film },
    { id: 'tests' as NavigationTab, label: 'Test Series', icon: FileSpreadsheet },
    { id: 'revisions' as NavigationTab, label: 'Revisions', icon: RotateCw },
    { id: 'ingestion' as NavigationTab, label: 'Ingestion Hub', icon: FolderSync },
    { id: 'settings' as NavigationTab, label: 'Settings', icon: Settings },
  ];

  return (
    <aside
      className={cn(
        'hidden lg:flex flex-col justify-between h-screen sticky top-0 z-40 transition-all duration-300 ease-in-out glass-sidebar select-none',
        collapsed ? 'w-20' : 'w-64',
        className
      )}
      aria-label="Main Desktop Navigation"
    >
      {/* Top Brand Header */}
      <div>
        <div className="h-16 flex items-center justify-between px-4 border-b border-zinc-200/80 dark:border-zinc-800/80">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 rounded-2xl bg-zinc-900 dark:bg-zinc-100 flex items-center justify-center text-zinc-100 dark:text-zinc-900 shadow-md shrink-0">
              <GraduationCap className="w-5 h-5" />
            </div>
            {!collapsed && (
              <div className="flex flex-col truncate">
                <span className="font-bold text-sm tracking-tight text-zinc-900 dark:text-zinc-50">
                  CA Tracker
                </span>
                <span className="text-[10px] font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  Foundation 2024
                </span>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            aria-label={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="p-3 space-y-1.5" aria-label="Primary Navigation">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onTabChange(item.id)}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-all duration-150 relative group min-h-[44px] touch-target',
                  isActive
                    ? 'bg-zinc-900 text-zinc-50 dark:bg-zinc-100 dark:text-zinc-900 shadow-sm'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800/60'
                )}
                title={collapsed ? item.label : undefined}
                aria-label={item.id === 'tests' ? 'Tests & Test Series' : item.label}
                aria-current={isActive ? 'page' : undefined}
              >
                <Icon className={cn('w-5 h-5 shrink-0 transition-transform group-hover:scale-110', isActive ? 'text-current' : 'text-zinc-500 dark:text-zinc-400')} />
                {!collapsed && <span className="truncate">{item.label}</span>}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Subject Mini Progress Widget (Expanded only) */}
      {!collapsed && (
        <div className="p-4 m-3 rounded-2xl bg-zinc-100/60 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800/80 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-zinc-700 dark:text-zinc-300">
              Syllabus Completion
            </span>
            <span className="font-bold text-zinc-900 dark:text-zinc-100 tabular-nums">
              {metrics.overallProgressPercentage}%
            </span>
          </div>

          <ProgressBar value={metrics.overallProgressPercentage} size="sm" />

          {/* 4 Mini Subject Dots/Gauges */}
          <div className="grid grid-cols-4 gap-1.5 pt-1">
            {(['paper1', 'paper2', 'paper3', 'paper4'] as const).map((pId) => {
              const group = subjectGroups[pId];
              const pct = group ? group.progressPercentage : 0;
              return (
                <div
                  key={pId}
                  className="flex flex-col items-center p-1.5 rounded-lg bg-white/70 dark:bg-zinc-800/70 border border-zinc-200/40 dark:border-zinc-700/40"
                  title={`${group?.meta.shortName || pId}: ${pct}% completed`}
                >
                  <span className="text-[9px] font-semibold uppercase text-zinc-500 dark:text-zinc-400">
                    {group?.meta.code || pId}
                  </span>
                  <span className="text-[10px] font-bold text-zinc-800 dark:text-zinc-200 tabular-nums">
                    {pct}%
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </aside>
  );
};
