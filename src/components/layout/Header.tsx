import React from 'react';
import { Flame, Clock, Cloud, RefreshCw, Menu } from 'lucide-react';
import { ThemeToggle } from '@/components/common/ThemeToggle';
import { UserMenu } from '@/components/auth/UserMenu';
import { useData } from '@/context/DataContext';
import { NavigationTab } from '@/types';
import { cn } from '@/lib/utils';

interface HeaderProps {
  activeTab: NavigationTab;
  onOpenMobileMenu?: () => void;
  className?: string;
}

const TAB_TITLES: Record<NavigationTab, string> = {
  dashboard: 'Command Center',
  schedule: 'Study Schedule & Calendar',
  checklist: 'Syllabus Checklist',
  lectures: 'Video Lectures & Watch History',
  tests: 'Test Series & Marks',
  revisions: 'Spaced Revisions',
  exercises: 'Digital Exercises',
  ingestion: 'Ingestion & Export Hub',
  settings: 'Settings & Profile',
};

export const Header: React.FC<HeaderProps> = ({ activeTab, onOpenMobileMenu, className }) => {
  const { metrics, isSyncing, isCloudConnected } = useData();

  return (
    <header
      className={cn(
        'sticky top-0 z-30 w-full min-h-16 pt-[max(0.5rem,env(safe-area-inset-top))] pb-2 bg-white/75 dark:bg-zinc-900/75 backdrop-blur-2xl border-b border-black/[0.05] dark:border-zinc-800/80 px-3 sm:px-6 flex items-center justify-between transition-colors shadow-[0_4px_20px_rgba(0,0,0,0.02)]',
        className
      )}
    >
      {/* Title & Mobile Brand Indicator + Menu Button */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        <div className="lg:hidden flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={onOpenMobileMenu}
            className="touch-target p-2 rounded-xl text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition-colors swiftui-press"
            aria-label="Open Navigation Menu"
            title="Open Mobile Navigation Menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <button
            type="button"
            onClick={onOpenMobileMenu}
            className="w-8 h-8 rounded-xl bg-zinc-900 dark:bg-zinc-100 flex items-center justify-center text-zinc-100 dark:text-zinc-900 font-bold text-xs shadow-xs shrink-0 cursor-pointer swiftui-press"
            aria-label="CA Tracker Menu"
            title="CA Foundation Command Center"
          >
            CA
          </button>
        </div>

        <div className="min-w-0">
          <h1 className="text-base sm:text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 truncate">
            {TAB_TITLES[activeTab] || 'Command Center'}
          </h1>
          <p className="text-[11px] sm:text-xs text-zinc-500 dark:text-zinc-400 hidden sm:block truncate">
            CA Foundation Preparation & Spaced Repetition Engine
          </p>
        </div>
      </div>

      {/* Action Stats & Theme Toggle */}
      <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0 ml-2">
        {/* Cloud Sync Status Pill */}
        <div
          className={cn(
            'hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium select-none transition-colors',
            isSyncing
              ? 'bg-blue-500/10 border-blue-500/20 text-blue-600 dark:text-blue-400'
              : isCloudConnected
              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400'
              : 'bg-zinc-500/10 border-black/5 dark:border-white/10 text-zinc-500 dark:text-zinc-400'
          )}
          title={
            isSyncing
              ? 'Syncing changes to Firebase cloud...'
              : isCloudConnected
              ? 'Firebase Cloud Sync Active — synced across all devices'
              : 'Operating in local offline mode'
          }
        >
          {isSyncing ? (
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-500" />
          ) : (
            <Cloud className={cn('w-3.5 h-3.5', isCloudConnected ? 'text-emerald-500' : 'text-zinc-400')} />
          )}
          <span className="hidden md:inline font-medium text-[11px]">
            {isSyncing ? 'Syncing...' : isCloudConnected ? 'Cloud Synced' : 'Local'}
          </span>
        </div>

        {/* Streak Pill */}
        <div
          className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-600 dark:text-orange-400 text-xs font-semibold tabular-nums select-none swiftui-press"
          title={`Current Streak: ${metrics.currentStreakDays} days (Best: ${metrics.bestStreakDays})`}
        >
          <Flame className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-orange-500 fill-orange-500/20 shrink-0" />
          <span>{metrics.currentStreakDays}d</span>
        </div>

        {/* Exam Countdown Pill */}
        <div
          className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full bg-zinc-500/10 border border-black/5 dark:border-white/10 text-zinc-700 dark:text-zinc-300 text-xs font-medium tabular-nums select-none swiftui-press"
          title={`Days remaining until CA Foundation Exam: ${metrics.daysUntilExam} days`}
        >
          <Clock className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400 shrink-0" />
          <span className="font-semibold text-zinc-900 dark:text-zinc-100">
            {metrics.daysUntilExam > 0 ? (
              <>
                <span>{metrics.daysUntilExam}d</span>
                <span className="hidden sm:inline"> left</span>
              </>
            ) : (
              'Exam Today!'
            )}
          </span>
        </div>

        {/* User Account / Profile Menu */}
        <UserMenu />

        {/* Theme Toggle */}
        <ThemeToggle />
      </div>
    </header>
  );
};

