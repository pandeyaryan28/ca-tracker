import React, { useState } from 'react';
import {
  LayoutDashboard,
  Calendar,
  CheckSquare,
  Film,
  FileSpreadsheet,
  RotateCw,
  HelpCircle,
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

  const navSections = [
    {
      title: 'Overview',
      items: [
        { id: 'dashboard' as NavigationTab, label: 'Dashboard', icon: LayoutDashboard },
        { id: 'schedule' as NavigationTab, label: 'Schedule', icon: Calendar },
        { id: 'checklist' as NavigationTab, label: 'Checklist', icon: CheckSquare },
      ],
    },
    {
      title: 'Study & Practice',
      items: [
        { id: 'exercises' as NavigationTab, label: 'Exercises', icon: HelpCircle },
        { id: 'tests' as NavigationTab, label: 'Test Series', icon: FileSpreadsheet },
        { id: 'lectures' as NavigationTab, label: 'Lectures', icon: Film },
        { id: 'revisions' as NavigationTab, label: 'Revisions', icon: RotateCw },
      ],
    },
    {
      title: 'System',
      items: [
        { id: 'ingestion' as NavigationTab, label: 'Ingestion Hub', icon: FolderSync },
        { id: 'settings' as NavigationTab, label: 'Settings', icon: Settings },
      ],
    },
  ];

  return (
    <aside
      className={cn(
        'hidden lg:flex flex-col justify-between h-screen sticky top-0 z-40 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] glass-sidebar bg-white/75 dark:bg-zinc-900/60 backdrop-blur-2xl border-r border-black/[0.05] dark:border-white/10 select-none',
        collapsed ? 'w-20' : 'w-64',
        className
      )}
      aria-label="Main Desktop Navigation"
    >
      {/* Top Brand Header */}
      <div>
        <div className="h-16 flex items-center justify-between px-4 border-b border-black/[0.05] dark:border-white/10">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-9 h-9 rounded-xl bg-zinc-900 dark:bg-zinc-100 flex items-center justify-center text-zinc-100 dark:text-zinc-900 shadow-sm shrink-0">
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
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition-colors swiftui-press"
            title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            aria-label={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation Items Grouped by Domain */}
        <nav className="p-3 space-y-3" aria-label="Primary Navigation">
          {navSections.map((section) => (
            <div key={section.title} className="space-y-1">
              {!collapsed && (
                <div className="px-3 pt-1 text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                  {section.title}
                </div>
              )}
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onTabChange(item.id)}
                    className={cn(
                      'w-full flex items-center gap-3 px-3.5 py-2 rounded-xl font-medium text-xs transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] relative group min-h-[40px] touch-target swiftui-press',
                      isActive
                        ? 'bg-zinc-900 text-zinc-50 dark:bg-white dark:text-zinc-950 shadow-sm'
                        : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-black/[0.04] dark:hover:bg-white/[0.06]'
                    )}
                    title={collapsed ? item.label : undefined}
                    aria-label={item.id === 'tests' ? 'Tests & Test Series' : item.label}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <Icon className={cn('w-4 h-4 shrink-0 transition-transform group-hover:scale-110', isActive ? 'text-current' : 'text-zinc-500 dark:text-zinc-400')} />
                    {!collapsed && <span className="truncate">{item.label}</span>}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>
      </div>

      {/* Bottom Subject Mini Progress Widget (Expanded only) */}
      {!collapsed && (
        <div className="p-4 m-3 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.04] dark:border-white/[0.06] space-y-3">
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
                  className="flex flex-col items-center p-1.5 rounded-xl bg-white/70 dark:bg-zinc-800/70 border border-black/[0.04] dark:border-white/[0.06]"
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
