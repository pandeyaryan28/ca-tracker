import React, { useState } from 'react';
import { Moon, Bell, Trophy, Cloud, RefreshCw, CheckCircle2, Laptop, Smartphone, BookOpen, ExternalLink } from 'lucide-react';
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
    <div className="space-y-6 max-w-3xl animate-fade-in">
      <div>
        <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">App Preferences & Settings</h2>
        <p className="text-xs text-zinc-500">
          Configure exam date, cloud sync, daily targets, and personalization options.
        </p>
      </div>

      {/* Cloud Backend Synchronization Card */}
      <Card className="space-y-4 border-emerald-500/30 dark:border-emerald-500/20 bg-emerald-50/30 dark:bg-emerald-950/10">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2.5 sm:gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Cloud className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                Firebase Multi-Device Cloud Sync
              </h3>
            </div>
            <p className="text-xs text-zinc-600 dark:text-zinc-400">
              Your syllabus progress, test marks, and spaced revisions are synchronized in real-time across all your devices without requiring a login.
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 select-none self-start shrink-0">
            <span className="w-1.5 h-1.5 rounded-sm bg-emerald-600 dark:bg-emerald-400" />
            {isCloudConnected ? 'Connected & Active' : 'Connecting...'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-xs">
          <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white/60 dark:bg-zinc-850 border border-zinc-200/60 dark:border-zinc-800">
            <Laptop className="w-4 h-4 text-zinc-500" />
            <div>
              <p className="font-semibold text-zinc-900 dark:text-zinc-100">Project Backend</p>
              <p className="text-[11px] text-zinc-500 font-mono">ca-tracker-ap28-2026</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white/60 dark:bg-zinc-850 border border-zinc-200/60 dark:border-zinc-800">
            <Smartphone className="w-4 h-4 text-zinc-500" />
            <div>
              <p className="font-semibold text-zinc-900 dark:text-zinc-100">Last Synchronized</p>
              <p className="text-[11px] text-zinc-500">
                {lastSyncedAt ? new Date(lastSyncedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : 'Just now'}
              </p>
            </div>
          </div>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <p className="text-[11px] text-zinc-500">
            Changes auto-save immediately. You can also force a full re-sync anytime.
          </p>
          <Button
            size="sm"
            variant="outline"
            onClick={handleManualSync}
            disabled={isSyncing}
            className="flex items-center justify-center gap-1.5 text-xs font-semibold touch-target min-h-[38px] w-full sm:w-auto shrink-0"
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
      </Card>

      <Card className="space-y-6">
        {/* Exam Date */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label
              htmlFor="settings-exam-date"
              className="block text-sm font-semibold text-zinc-900 dark:text-zinc-100"
            >
              CA Foundation Exam Target Date
            </label>
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800">
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
            className="p-2.5 text-xs rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100"
          />
          <p className="text-[11px] text-zinc-500">
            Used to calculate the live exam countdown and daily study pace requirements. Automatically saved and synchronized to Cloud Firestore.
          </p>
        </div>

        <div className="border-t border-zinc-200 dark:border-zinc-800" />

        {/* Daily Study Goal */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            Daily Study Goal (Hours)
          </label>
          <input
            type="number"
            min="1"
            max="16"
            step="0.5"
            value={settings.dailyGoalHours}
            onChange={(e) => updateSettings({ dailyGoalHours: parseFloat(e.target.value) || 6 })}
            className="w-32 p-2.5 text-xs rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100"
          />
        </div>

        <div className="border-t border-zinc-200 dark:border-zinc-800" />

        {/* Theme Settings */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <Moon className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
              <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                Visual Appearance
              </span>
            </div>
            <p className="text-xs text-zinc-500">
              Select Light, Dark, or System mode matching OS preference
            </p>
          </div>

          <ThemeToggle showSegmented />
        </div>

        <div className="border-t border-zinc-200 dark:border-zinc-800" />

        {/* Celebration & Sound Effects */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-500" />
              <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                Celebration Confetti
              </span>
            </div>
            <input
              type="checkbox"
              checked={settings.confettiEnabled}
              onChange={(e) => updateSettings({ confettiEnabled: e.target.checked })}
              className="w-4 h-4 rounded accent-zinc-900 dark:accent-zinc-100"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-zinc-500" />
              <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                Micro-interaction Audio
              </span>
            </div>
            <input
              type="checkbox"
              checked={settings.soundEnabled}
              onChange={(e) => updateSettings({ soundEnabled: e.target.checked })}
              className="w-4 h-4 rounded accent-zinc-900 dark:accent-zinc-100"
            />
          </div>
        </div>
      </Card>

      {/* Official ICAI Study Material Portal Card */}
      <Card className="space-y-4 border-blue-500/30 dark:border-blue-500/20 bg-blue-50/30 dark:bg-blue-950/10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 shrink-0">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                Official ICAI BoS Knowledge Portal (May 2026 Onwards)
              </h3>
              <p className="text-xs text-zinc-500">
                All 46 chapters & 99 units/chapters are aligned with official PDF study materials.
              </p>
            </div>
          </div>
          <a
            href="https://www.icai.org/post/foundation-nset"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-1 px-3 py-2 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white transition-colors touch-target min-h-[38px] shrink-0"
          >
            <span>Visit ICAI Portal</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </Card>
    </div>
  );
};

