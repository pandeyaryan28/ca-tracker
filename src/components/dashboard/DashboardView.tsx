import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Scale,
  Calculator,
  TrendingUp,
  CheckCircle2,
  Clock,
  Flame,
  Award,
  Calendar,
  Target,
  ChevronRight,
  RefreshCw,
  FileText,
  ExternalLink,
  Play,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useData } from '@/context/DataContext';
import { Card } from '@/components/common/Card';
import { Badge } from '@/components/common/Badge';
import { ProgressBar } from '@/components/common/ProgressBar';
import { Button } from '@/components/common/Button';
import { RadialGauge } from '@/components/common/RadialGauge';
import { SubjectId, NavigationTab } from '@/types';
import { formatMinutes } from '@/lib/utils';

interface DashboardViewProps {
  onNavigate?: (tab: NavigationTab) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onNavigate }) => {
  const {
    metrics,
    actionPlan,
    subjectGroups,
    settings,
    updateTopicStatus,
    toggleScheduleEntry,
    updateSettings,
    topics,
  } = useData();

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [newExamDate, setNewExamDate] = useState(settings.examDate || '2026-11-01');
  const [isSavingDate, setIsSavingDate] = useState(false);
  const [syncNotice, setSyncNotice] = useState(false);

  useEffect(() => {
    if (settings.examDate) {
      setNewExamDate(settings.examDate);
    }
  }, [settings.examDate]);

  // Real-time precision countdown ticker (Days, Hours, Mins, Secs)
  const [timeRemaining, setTimeRemaining] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const updateCountdown = () => {
      const targetStr = settings.examDate || '2026-11-01';
      const targetDate = new Date(targetStr);
      targetDate.setHours(9, 0, 0, 0); // 9:00 AM exam time
      const now = new Date();
      const diffMs = targetDate.getTime() - now.getTime();

      if (diffMs <= 0) {
        setTimeRemaining({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      const totalSecs = Math.floor(diffMs / 1000);
      const days = Math.floor(totalSecs / (3600 * 24));
      const hours = Math.floor((totalSecs % (3600 * 24)) / 3600);
      const minutes = Math.floor((totalSecs % 3600) / 60);
      const seconds = totalSecs % 60;

      setTimeRemaining({ days, hours, minutes, seconds });
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [settings.examDate]);

  const handleActionComplete = (topicId: string) => {
    updateTopicStatus(topicId, 'completed');
    if (settings.confettiEnabled) {
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.8 },
          colors: ['#10B981', '#8B5CF6', '#06B6D4', '#F59E0B'],
        });
      } catch {
        // Fallback for non-browser or test runner
      }
    }
  };

  const handleScheduleToggle = (entryId: string, completed: boolean) => {
    toggleScheduleEntry(entryId, completed);
    if (completed && settings.confettiEnabled) {
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.8 },
          colors: ['#10B981', '#8B5CF6', '#06B6D4', '#F59E0B'],
        });
      } catch {
        // Fallback for non-browser or test runner
      }
    }
  };

  const handleSaveExamDate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newExamDate && newExamDate.trim()) {
      setIsSavingDate(true);
      await updateSettings({ examDate: newExamDate.trim() });
      setIsSavingDate(false);
      setShowDatePicker(false);
      setSyncNotice(true);
      setTimeout(() => setSyncNotice(false), 3500);
    }
  };

  const getSubjectIcon = (id: SubjectId) => {
    switch (id) {
      case 'paper1':
        return <BookOpen className="w-5 h-5 text-emerald-500" />;
      case 'paper2':
        return <Scale className="w-5 h-5 text-violet-500" />;
      case 'paper3':
        return <Calculator className="w-5 h-5 text-cyan-500" />;
      case 'paper4':
        return <TrendingUp className="w-5 h-5 text-amber-500" />;
    }
  };

  // Remaining estimated study hours
  const totalRemainingStudyHours = Number(
    topics
      .filter((t) => t.status !== 'completed')
      .reduce((sum, t) => sum + (t.estimatedHours || 0), 0)
      .toFixed(1)
  );

  const requiredDailyStudyHours =
    metrics.daysUntilExam > 0
      ? Number((totalRemainingStudyHours / Math.max(1, metrics.daysUntilExam)).toFixed(1))
      : 0;

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in">
      {/* Hero Command Center Banner */}
      <Card className="relative overflow-hidden bg-gradient-to-br from-zinc-900 to-zinc-950 text-white dark:from-zinc-900 dark:to-zinc-950 border-zinc-800 p-6 sm:p-8">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-xl">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className="border-zinc-700 text-zinc-300">
                ICAI CA Foundation 2024
              </Badge>
              <Badge
                variant={
                  metrics.aggregatePassingLikelihood === 'On Track'
                    ? 'success'
                    : metrics.aggregatePassingLikelihood === 'Needs Attention'
                    ? 'warning'
                    : 'danger'
                }
              >
                {metrics.aggregatePassingLikelihood}
              </Badge>
            </div>

            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Syllabus Completion: {metrics.overallProgressPercentage}%
            </h2>

            <p className="text-sm text-zinc-400">
              {metrics.completedTopics} of {metrics.totalTopics} topics completed across all 4
              papers. {totalRemainingStudyHours} hrs of study remaining.
            </p>

            {/* Live Precision Countdown Ticker */}
            <div className="pt-2">
              <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-400 font-medium mb-1.5">
                <Clock className="w-4 h-4 text-emerald-400" />
                <span>Live Target Countdown:</span>
                <button
                  type="button"
                  onClick={() => {
                    setNewExamDate(settings.examDate);
                    setShowDatePicker(true);
                  }}
                  className="underline hover:text-white transition-colors"
                >
                  Edit Exam Date ({settings.examDate})
                </button>
                {syncNotice && (
                  <span className="text-[11px] font-semibold text-emerald-300 bg-emerald-500/20 border border-emerald-500/30 px-2 py-0.5 rounded-md animate-fade-in">
                    ✓ Synced to Cloud
                  </span>
                )}
              </div>

              <div className="grid grid-cols-4 gap-1.5 sm:gap-2 max-w-sm">
                <div className="bg-zinc-800/80 rounded-xl p-1.5 sm:p-2 text-center border border-zinc-700/60">
                  <span className="text-base sm:text-xl font-bold text-white tabular-nums block">
                    {timeRemaining.days}
                  </span>
                  <span className="text-[9px] sm:text-[10px] text-zinc-400 uppercase font-semibold">Days</span>
                </div>
                <div className="bg-zinc-800/80 rounded-xl p-1.5 sm:p-2 text-center border border-zinc-700/60">
                  <span className="text-base sm:text-xl font-bold text-white tabular-nums block">
                    {timeRemaining.hours}
                  </span>
                  <span className="text-[9px] sm:text-[10px] text-zinc-400 uppercase font-semibold">Hours</span>
                </div>
                <div className="bg-zinc-800/80 rounded-xl p-1.5 sm:p-2 text-center border border-zinc-700/60">
                  <span className="text-base sm:text-xl font-bold text-white tabular-nums block">
                    {timeRemaining.minutes}
                  </span>
                  <span className="text-[9px] sm:text-[10px] text-zinc-400 uppercase font-semibold">Mins</span>
                </div>
                <div className="bg-zinc-800/80 rounded-xl p-1.5 sm:p-2 text-center border border-zinc-700/60">
                  <span className="text-base sm:text-xl font-bold text-emerald-400 tabular-nums block">
                    {timeRemaining.seconds}
                  </span>
                  <span className="text-[9px] sm:text-[10px] text-zinc-400 uppercase font-semibold">Secs</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Metrics Columns */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 border-t lg:border-t-0 lg:border-l border-zinc-800 pt-4 lg:pt-0 lg:pl-8">
            <div className="space-y-1">
              <span className="text-xs text-zinc-400 font-medium">Daily Study Streak</span>
              <div className="text-xl sm:text-2xl font-bold text-orange-400 tabular-nums flex items-center gap-1.5">
                <Flame className="w-5 h-5 text-orange-400 fill-orange-400/20" />
                {metrics.currentStreakDays}d
              </div>
              <span className="text-[11px] text-zinc-500 block">
                Best: {metrics.bestStreakDays} days
              </span>
            </div>

            <div className="space-y-1">
              <span className="text-xs text-zinc-400 font-medium">Study Logged</span>
              <div className="text-xl sm:text-2xl font-bold text-emerald-400 tabular-nums flex items-center gap-1.5">
                <Award className="w-5 h-5 text-emerald-400" />
                {metrics.totalStudyHoursLogged}h
              </div>
              <span className="text-[11px] text-zinc-500 block">
                Goal: {settings.dailyGoalHours}h / day
              </span>
            </div>

            <div className="space-y-1 col-span-2 sm:col-span-1">
              <span className="text-xs text-zinc-400 font-medium">Pace Required</span>
              <div className="text-xl sm:text-2xl font-bold text-cyan-400 tabular-nums flex items-center gap-1.5">
                <Target className="w-5 h-5 text-cyan-400" />
                {requiredDailyStudyHours}h
              </div>
              <span className="text-[11px] text-zinc-500 block">per day to finish syllabus</span>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-zinc-800/80">
          <ProgressBar value={metrics.overallProgressPercentage} size="md" colorHex="#10B981" />
        </div>
      </Card>

      {/* 4-Subject SVG Radial Gauges Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
              Official 4-Paper Progress
            </h3>
            <p className="text-xs text-zinc-500">
              ICAI minimum passing threshold is 40% per subject & 50% aggregate score
            </p>
          </div>
          {onNavigate && (
            <button
              type="button"
              onClick={() => onNavigate('checklist')}
              className="text-xs text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 flex items-center gap-1 font-medium"
            >
              View Checklist <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {(['paper1', 'paper2', 'paper3', 'paper4'] as const).map((paperId) => {
            const group = subjectGroups[paperId];
            if (!group) return null;
            const meta = group.meta;

            return (
              <Card
                key={paperId}
                hoverEffect
                className="flex flex-col items-center justify-between p-5 space-y-4 text-center"
              >
                <div className="w-full flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800">
                      {getSubjectIcon(paperId)}
                    </div>
                    <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
                      {meta.code}
                    </span>
                  </div>
                  <Badge
                    variant={group.progressPercentage >= 40 ? 'completed' : 'pending'}
                    size="sm"
                  >
                    {group.progressPercentage >= 40 ? 'Pass Safe' : 'In Progress'}
                  </Badge>
                </div>

                {/* SVG Radial Gauge */}
                <RadialGauge
                  percentage={group.progressPercentage}
                  size={110}
                  strokeWidth={9}
                  color={meta.color.primary}
                  label={meta.shortName}
                />

                <div className="w-full space-y-2 border-t border-zinc-100 dark:border-zinc-800/80 pt-3">
                  <div className="flex items-center justify-between text-xs text-zinc-600 dark:text-zinc-400 tabular-nums">
                    <span>{group.completedTopics} of {group.totalTopics} Topics</span>
                    <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                      {group.progressPercentage}%
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-zinc-500">
                    <span>{group.chapters.length} Chapters</span>
                    <span>{group.completedEstimatedHours} / {group.totalEstimatedHours}h</span>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Today's Action Plan */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
              Today's Action Plan
            </h3>
            <Badge variant="outline" size="sm">
              {metrics.todayActionItemsCompleted} / {metrics.todayActionItemsTotal} Done
            </Badge>
          </div>
          {onNavigate && (
            <button
              type="button"
              onClick={() => onNavigate('schedule')}
              className="text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:underline inline-flex items-center gap-1"
            >
              <Calendar className="w-3.5 h-3.5" /> View Full Schedule →
            </button>
          )}
        </div>

        {actionPlan.length === 0 ? (
          <Card className="text-center py-10 space-y-2">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h4 className="font-semibold text-zinc-900 dark:text-zinc-100 text-sm">
              All caught up for today!
            </h4>
            <p className="text-xs text-zinc-500 max-w-sm mx-auto">
              Check your full study schedule or complete pending topics to trigger
              spaced repetition cycles.
            </p>
          </Card>
        ) : (
          <div className="space-y-2.5">
            {actionPlan.map((item) => (
              <Card
                key={item.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 sm:p-4 gap-3 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors"
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div className="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 shrink-0 mt-0.5">
                    {item.type === 'lesson' && <BookOpen className="w-4 h-4" />}
                    {item.type === 'schedule' && <Calendar className="w-4 h-4 text-cyan-500" />}
                    {item.type === 'revision' && <RefreshCw className="w-4 h-4 text-violet-500" />}
                    {item.type === 'test' && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                      <Badge variant={item.subjectId || 'default'} size="sm">
                        {item.subjectName}
                      </Badge>
                      {item.isOverdue && (
                        <Badge variant="danger" size="sm">
                          Overdue
                        </Badge>
                      )}
                      <h4
                        className={`text-sm font-medium break-words ${
                          item.isCompleted
                            ? 'line-through text-zinc-400 dark:text-zinc-500'
                            : 'text-zinc-900 dark:text-zinc-100'
                        }`}
                      >
                        {item.title}
                      </h4>
                    </div>
                    {item.chapterName && (
                      <p className="text-xs text-zinc-500 mt-0.5">{item.chapterName}</p>
                    )}
                    {item.notes && (
                      <p className="text-[11px] text-zinc-400 dark:text-zinc-500 italic mt-0.5">
                        {item.notes}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-zinc-100 dark:border-zinc-800/80">
                  <span className="text-xs text-zinc-400 tabular-nums mr-1">
                    {formatMinutes(item.estimatedMinutes)}
                  </span>
                  <div className="flex items-center gap-1.5">
                    {(() => {
                      const matchingTopic = item.topicId
                        ? topics.find((t) => t.id === item.topicId)
                        : item.topicIds && item.topicIds.length > 0
                        ? topics.find((t) => item.topicIds!.includes(t.id) && (t.videoUrl || t.pdfUrl))
                        : undefined;
                      return (
                        <>
                          {matchingTopic?.videoUrl && (
                            <a
                              href={matchingTopic.videoUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/60 transition-colors inline-flex items-center gap-1 text-xs touch-target min-h-[36px]"
                              title={matchingTopic.videoTitle ? `Watch Lecture: ${matchingTopic.videoTitle}` : 'Watch YouTube Lecture'}
                            >
                              <Play className="w-3.5 h-3.5 fill-current" />
                              <span className="hidden xs:inline font-medium">Lecture</span>
                              <ExternalLink className="w-3 h-3 opacity-70" />
                            </a>
                          )}
                          {matchingTopic?.pdfUrl && (
                            <a
                              href={matchingTopic.pdfUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 rounded-lg text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/60 transition-colors inline-flex items-center gap-1 text-xs touch-target min-h-[36px]"
                              title="Open ICAI Study Material PDF"
                            >
                              <FileText className="w-3.5 h-3.5" />
                              <span className="hidden xs:inline font-medium">PDF</span>
                              <ExternalLink className="w-3 h-3 opacity-70" />
                            </a>
                          )}
                        </>
                      );
                    })()}
                    {!item.isCompleted && (
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() => {
                          if (item.scheduleEntryId) {
                            handleScheduleToggle(item.scheduleEntryId, true);
                          } else if (item.topicId) {
                            handleActionComplete(item.topicId);
                          }
                        }}
                        leftIcon={<CheckCircle2 className="w-4 h-4" />}
                        className="touch-target"
                      >
                        Complete
                      </Button>
                    )}
                    {item.isCompleted && (
                      item.scheduleEntryId ? (
                        <button
                          type="button"
                          onClick={() => handleScheduleToggle(item.scheduleEntryId!, false)}
                          title="Click to mark incomplete"
                          className="hover:opacity-80 transition-opacity touch-target"
                        >
                          <Badge variant="completed" size="sm">
                            ✓ Done
                          </Badge>
                        </button>
                      ) : (
                        <Badge variant="completed" size="sm">
                          Done
                        </Badge>
                      )
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* Edit Exam Date Modal */}
      {showDatePicker && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <Card className="w-full max-w-sm p-6 space-y-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-zinc-700 dark:text-zinc-300" />
              <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                Set CA Foundation Exam Date
              </h3>
            </div>
            <form onSubmit={handleSaveExamDate} className="space-y-4">
              <div>
                <label
                  htmlFor="dashboard-exam-date"
                  className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1"
                >
                  Target Exam Date
                </label>
                <input
                  id="dashboard-exam-date"
                  type="date"
                  value={newExamDate}
                  onChange={(e) => setNewExamDate(e.target.value)}
                  className="w-full p-2.5 text-xs rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100"
                  required
                />
                <p className="text-[11px] text-zinc-500 mt-1.5">
                  Synchronized across all your devices via Firebase Cloud Firestore.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowDatePicker(false)}
                  disabled={isSavingDate}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm" disabled={isSavingDate}>
                  {isSavingDate ? 'Saving...' : 'Save Date & Cloud Sync'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
};
