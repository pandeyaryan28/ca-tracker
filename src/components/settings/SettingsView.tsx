import React, { useState } from 'react';
import { Moon, Bell, Trophy, Cloud, RefreshCw, CheckCircle2, Laptop, Smartphone, BookOpen, ExternalLink, Calendar, Target } from 'lucide-react';
import { useData } from '@/context/DataContext';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { ThemeToggle } from '@/components/common/ThemeToggle';

export const SettingsView: React.FC = () => {
  const { settings, updateSettings, isSyncing, isCloudConnected, lastSyncedAt, syncWithCloud } = useData();
  const [syncSuccess, setSyncSuccess] = useState(false);

  const handleManualSync = async () => {
    if (syncWithCloud) {
      await syncWithCloud();
      setSyncSuccess(true);
      setTimeout(() => setSyncSuccess(false), 3000);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl animate-fade-in pb-12">
      {/* Liquid Glass Command Header */}
      <div className="relative overflow-hidden rounded-3xl p-6 sm:p-8 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-2xl border border-white/20 dark:border-white/10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_12px_40px_rgb(0,0,0,0.4)]">
        <div className="space-y-1.5 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[11px] font-semibold tracking-wide uppercase border border-blue-500/20">
            System Configuration
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            App Preferences & Settings
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium max-w-xl">
            Configure exam target date, real-time cloud synchronization, daily study goals, and interface experience.
          </p>
        </div>
      </div>

      {/* Cloud Backend Synchronization Card */}
      <div className="relative overflow-hidden rounded-3xl p-6 bg-emerald-500/[0.05] dark:bg-emerald-500/[0.08] backdrop-blur-2xl border border-emerald-500/30 dark:border-emerald-500/20 shadow-[0_8px_30px_rgba(16,185,129,0.06)] space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <Cloud className="w-4 h-4" />
              </div>
              <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                Firebase Multi-Device Cloud Sync
              </h3>
            </div>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-xl">
              Your syllabus progress, test marks, and spaced revisions are synchronized in real-time across all your devices without requiring a login.
            </p>
          </div>
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-semibold bg-emerald-100/80 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300 border border-emerald-300/60 dark:border-emerald-700/60 select-none self-start shrink-0">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            {isCloudConnected ? 'Connected & Active' : 'Connecting...'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-xs">
          <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-white/70 dark:bg-zinc-800/70 border border-black/5 dark:border-white/10 shadow-xs">
            <Laptop className="w-4 h-4 text-zinc-500" />
            <div>
              <p className="font-semibold text-zinc-900 dark:text-zinc-100">Project Backend</p>
              <p className="text-[11px] text-zinc-500 font-mono">ca-tracker-ap28-2026</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-white/70 dark:bg-zinc-800/70 border border-black/5 dark:border-white/10 shadow-xs">
            <Smartphone className="w-4 h-4 text-zinc-500" />
            <div>
              <p className="font-semibold text-zinc-900 dark:text-zinc-100">Last Synchronized</p>
              <p className="text-[11px] text-zinc-500">
                {lastSyncedAt ? new Date(lastSyncedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : 'Just now'}
              </p>
            </div>
          </div>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-emerald-500/15">
          <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
            Changes auto-save immediately. You can also force a full re-sync anytime.
          </p>
          <Button
            size="sm"
            variant="outline"
            onClick={handleManualSync}
            disabled={isSyncing}
            className="rounded-full swiftui-press flex items-center justify-center gap-2 text-xs font-semibold px-4 py-2 shrink-0 bg-white/80 dark:bg-zinc-800/80 border-emerald-500/30 text-emerald-700 dark:text-emerald-300"
          >
            {isSyncing ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                Syncing...
              </>
            ) : syncSuccess ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                Synced!
              </>
            ) : (
              <>
                <RefreshCw className="w-3.5 h-3.5" />
                Force Cloud Re-sync
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Preferences Grouped Inset Card */}
      <Card className="p-6 sm:p-7 rounded-3xl bg-white/70 dark:bg-zinc-900/70 backdrop-blur-2xl border border-white/20 dark:border-white/10 shadow-[0_8px_30px_rgb(0,0,0,0.03)] space-y-6">
        {/* Exam Date */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <label
              htmlFor="settings-exam-date"
              className="flex items-center gap-2 text-sm font-semibold text-zinc-900 dark:text-zinc-100"
            >
              <Calendar className="w-4 h-4 text-blue-500" />
              <span>CA Foundation Exam Target Date</span>
            </label>
            <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
              <Cloud className="w-3 h-3" /> Cloud Synced
            </span>
          </div>
          <input
            id="settings-exam-date"
            type="date"
            value={settings.examDate}
            onChange={(e) => {
              if (e.target.value && e.target.value.trim()) {
                updateSettings({ examDate: e.target.value.trim() });
              }
            }}
            className="w-full sm:w-auto px-4 py-2.5 text-xs font-medium rounded-2xl bg-black/[0.03] dark:bg-white/[0.05] border border-black/5 dark:border-white/10 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
          />
          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed">
            Used to calculate the live exam countdown and daily study pace requirements. Automatically saved and synchronized to Cloud Firestore.
          </p>
        </div>

        <div className="border-t border-black/5 dark:border-white/5" />

        {/* Daily Study Goal */}
        <div className="space-y-2.5">
          <label className="flex items-center gap-2 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            <Target className="w-4 h-4 text-emerald-500" />
            <span>Daily Study Goal (Hours)</span>
          </label>
          <input
            type="number"
            min="1"
            max="16"
            step="0.5"
            value={settings.dailyGoalHours}
            onChange={(e) => updateSettings({ dailyGoalHours: parseFloat(e.target.value) || 6 })}
            className="w-32 px-4 py-2.5 text-xs font-semibold rounded-2xl bg-black/[0.03] dark:bg-white/[0.05] border border-black/5 dark:border-white/10 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
          />
        </div>

        <div className="border-t border-black/5 dark:border-white/5" />

        {/* Theme Settings */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <Moon className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
              <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                Visual Appearance
              </span>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Select Light, Dark, or System mode matching OS preference
            </p>
          </div>

          <ThemeToggle showSegmented />
        </div>

        <div className="border-t border-black/5 dark:border-white/5" />

        {/* Celebration & Sound Effects */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Trophy className="w-4 h-4 text-amber-500" />
              <div>
                <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 block">
                  Celebration Confetti
                </span>
                <span className="text-xs text-zinc-500 dark:text-zinc-400">
                  Trigger celebratory burst upon 100% chapter mastery
                </span>
              </div>
            </div>
            <input
              type="checkbox"
              checked={settings.confettiEnabled}
              onChange={(e) => updateSettings({ confettiEnabled: e.target.checked })}
              className="w-5 h-5 rounded-lg accent-zinc-900 dark:accent-zinc-100 cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Bell className="w-4 h-4 text-zinc-500" />
              <div>
                <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 block">
                  Micro-interaction Audio
                </span>
                <span className="text-xs text-zinc-500 dark:text-zinc-400">
                  Subtle tactile audio clicks when advancing revision cycles
                </span>
              </div>
            </div>
            <input
              type="checkbox"
              checked={settings.soundEnabled}
              onChange={(e) => updateSettings({ soundEnabled: e.target.checked })}
              className="w-5 h-5 rounded-lg accent-zinc-900 dark:accent-zinc-100 cursor-pointer"
            />
          </div>
        </div>
      </Card>

      {/* Official ICAI Study Material Portal Card */}
      <div className="relative overflow-hidden rounded-3xl p-6 bg-blue-500/[0.05] dark:bg-blue-500/[0.08] backdrop-blur-2xl border border-blue-500/25 dark:border-blue-500/15 shadow-[0_8px_30px_rgba(59,130,246,0.06)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-500/15 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                Official ICAI BoS Knowledge Portal (May 2026 Onwards)
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                All 46 chapters & 99 units/chapters are aligned with official PDF study materials.
              </p>
            </div>
          </div>
          <a
            href="https://www.icai.org/post/foundation-nset"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-full text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white transition-all swiftui-press shadow-md shrink-0"
          >
            <span>Visit ICAI Portal</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
};
