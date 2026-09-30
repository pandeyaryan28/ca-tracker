import React, { useState, useMemo } from 'react';
import {
  Calendar as CalendarIcon,
  CalendarDays,
  CheckCircle2,
  Circle,
  ChevronLeft,
  ChevronRight,
  Plus,
  RotateCcw,
  Filter,
  X,
  Target,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useData } from '@/context/DataContext';
import { Card } from '@/components/common/Card';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import { ProgressBar } from '@/components/common/ProgressBar';
import { SubjectId, ScheduleEntry } from '@/types';
import { cn, formatCompactDate, formatDate, getTodayDateString } from '@/lib/utils';
import { SUBJECT_METADATA_MAP } from '@/lib/constants';

type ViewMode = 'calendar' | 'agenda';

export const ScheduleView: React.FC = () => {
  const {
    schedule,
    toggleScheduleEntry,
    addScheduleEntry,
    settings,
  } = useData();

  const today = getTodayDateString(); // e.g. '2026-09-09'

  const [viewMode, setViewMode] = useState<ViewMode>('calendar');
  const [selectedDate, setSelectedDate] = useState<string>(today);
  const [subjectFilter, setSubjectFilter] = useState<SubjectId | 'all' | 'revision'>('all');

  // Month navigation for Calendar View: Default to September 2026
  const [currentYear, setCurrentYear] = useState<number>(() => {
    const parts = today.split('-');
    return parts.length === 3 ? parseInt(parts[0], 10) : 2026;
  });
  const [currentMonth, setCurrentMonth] = useState<number>(() => {
    const parts = today.split('-');
    return parts.length === 3 ? parseInt(parts[1], 10) - 1 : 8; // 8 = September (0-indexed)
  });

  // Modal for adding a custom schedule item
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDate, setNewDate] = useState(today);
  const [newSubject, setNewSubject] = useState<SubjectId | 'none'>('paper1');
  const [newNotes, setNewNotes] = useState('');
  const [newIsRevision, setNewIsRevision] = useState(false);
  const [addError, setAddError] = useState('');

  // Calculate high-level metrics
  const totalTasks = schedule.length;
  const completedTasks = schedule.filter((s) => s.completed).length;
  const overallPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Today's schedule items
  const todayItems = useMemo(() => {
    return schedule.filter((s) => s.date === today);
  }, [schedule, today]);

  const todayCompletedCount = todayItems.filter((s) => s.completed).length;

  // Filtered items based on subject/revision filter
  const filteredSchedule = useMemo(() => {
    return schedule.filter((item) => {
      if (subjectFilter === 'revision') return item.isRevision;
      if (subjectFilter !== 'all') return item.subjectId === subjectFilter;
      return true;
    });
  }, [schedule, subjectFilter]);

  // Group items by date for agenda view
  const groupedByDate = useMemo(() => {
    const map = new Map<string, ScheduleEntry[]>();
    for (const item of filteredSchedule) {
      if (!map.has(item.date)) {
        map.set(item.date, []);
      }
      map.get(item.date)!.push(item);
    }
    // Sort dates chronologically
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [filteredSchedule]);

  // Calendar calculations
  const calendarDays = useMemo(() => {
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);

    const startingDayOfWeek = firstDay.getDay(); // 0 = Sunday
    const daysInMonth = lastDay.getDate();

    const days: Array<{
      dateStr: string;
      dayNumber: number;
      isCurrentMonth: boolean;
      items: ScheduleEntry[];
    }> = [];

    // Previous month padding
    const prevMonthLastDay = new Date(currentYear, currentMonth, 0).getDate();
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const d = prevMonthLastDay - i;
      const m = currentMonth === 0 ? 12 : currentMonth;
      const y = currentMonth === 0 ? currentYear - 1 : currentYear;
      const dateStr = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const dayItems = schedule.filter((s) => s.date === dateStr);
      days.push({
        dateStr,
        dayNumber: d,
        isCurrentMonth: false,
        items: dayItems,
      });
    }

    // Current month days
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const dayItems = schedule.filter((s) => s.date === dateStr);
      days.push({
        dateStr,
        dayNumber: d,
        isCurrentMonth: true,
        items: dayItems,
      });
    }

    // Next month padding to fill a complete 35 or 42 grid
    const remaining = (7 - (days.length % 7)) % 7;
    for (let d = 1; d <= remaining; d++) {
      const m = currentMonth === 11 ? 1 : currentMonth + 2;
      const y = currentMonth === 11 ? currentYear + 1 : currentYear;
      const dateStr = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const dayItems = schedule.filter((s) => s.date === dateStr);
      days.push({
        dateStr,
        dayNumber: d,
        isCurrentMonth: false,
        items: dayItems,
      });
    }

    return days;
  }, [currentYear, currentMonth, schedule]);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const handleJumpToToday = () => {
    const parts = today.split('-');
    if (parts.length === 3) {
      setCurrentYear(parseInt(parts[0], 10));
      setCurrentMonth(parseInt(parts[1], 10) - 1);
      setSelectedDate(today);
    }
  };

  const handleToggleEntry = (entryId: string, currentCompleted: boolean) => {
    toggleScheduleEntry(entryId, !currentCompleted);
    if (!currentCompleted && settings.confettiEnabled) {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
      });
    }
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAddError('');
    if (!newTitle.trim()) {
      setAddError('Task title is required');
      return;
    }

    addScheduleEntry({
      date: newDate,
      displayDate: formatCompactDate(newDate),
      title: newTitle.trim(),
      subjectId: newSubject !== 'none' ? newSubject : undefined,
      isRevision: newIsRevision,
      notes: newNotes.trim() || undefined,
      completed: false,
    });

    setNewTitle('');
    setNewNotes('');
    setNewIsRevision(false);
    setShowAddModal(false);
  };

  // Selected date items for Calendar View inspector
  const selectedDateItems = useMemo(() => {
    return schedule.filter((s) => s.date === selectedDate);
  }, [schedule, selectedDate]);

  return (
    <div className="space-y-6 animate-fade-in max-w-7xl mx-auto pb-16">
      {/* 1. Top Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-zinc-900 text-zinc-50 dark:bg-zinc-900/90 dark:text-zinc-100 p-5 sm:p-6 rounded-2xl border border-zinc-800 shadow-xl relative overflow-hidden">
        <div className="space-y-1 relative z-10">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Active Syllabus Schedule
            </span>
            <span className="text-xs text-zinc-400 font-mono">
              9 Sept – 20 Sept 2026
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            Daily Study Schedule & Roadmap
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 max-w-xl">
            Strictly synchronized with your preparation notes. Track daily milestones, review upcoming revision intervals, and stay on top of the ICAI curriculum.
          </p>
        </div>

        {/* View Switcher & Quick Actions */}
        <div className="flex flex-wrap items-center gap-2.5 relative z-10">
          <div className="flex items-center p-1 bg-zinc-800/80 rounded-2xl border border-zinc-700/80">
            <button
              type="button"
              onClick={() => setViewMode('calendar')}
              className={cn(
                'flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all touch-target',
                viewMode === 'calendar'
                  ? 'bg-zinc-100 text-zinc-900 dark:bg-zinc-100 dark:text-zinc-900 shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              )}
            >
              <CalendarIcon className="w-3.5 h-3.5" />
              <span>Calendar</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('agenda')}
              className={cn(
                'flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all touch-target',
                viewMode === 'agenda'
                  ? 'bg-zinc-100 text-zinc-900 dark:bg-zinc-100 dark:text-zinc-900 shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              )}
            >
              <CalendarDays className="w-3.5 h-3.5" />
              <span>Agenda</span>
            </button>
          </div>

          <Button
            size="sm"
            onClick={() => {
              setNewDate(selectedDate || today);
              setShowAddModal(true);
            }}
            className="flex items-center gap-1.5 bg-white text-zinc-950 hover:bg-zinc-200 font-semibold"
          >
            <Plus className="w-4 h-4" />
            <span>Add Task</span>
          </Button>
        </div>
      </div>

      {/* 2. Top Metrics & Today Spotlight */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Metric 1: Overall Schedule Completion */}
        <Card className="flex flex-col justify-between p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
              Schedule Completion
            </span>
            <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 tabular-nums">
              {completedTasks} of {totalTasks} Done
            </span>
          </div>
          <div className="space-y-1.5">
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-50 tabular-nums">
                {overallPercentage}%
              </span>
              <span className="text-xs text-zinc-500 font-medium">
                {totalTasks - completedTasks} tasks remaining
              </span>
            </div>
            <ProgressBar value={overallPercentage} size="md" />
          </div>
        </Card>

        {/* Metric 2: Today's Target (Sept 9) */}
        <Card className="p-5 space-y-3 bg-gradient-to-br from-amber-500/5 to-transparent border-amber-500/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span className="text-xs font-bold text-amber-700 dark:text-amber-300 uppercase tracking-wider">
                Today's Target ({formatCompactDate(today)})
              </span>
            </div>
            <span className="text-xs font-semibold text-zinc-500 tabular-nums">
              {todayCompletedCount}/{todayItems.length} Done
            </span>
          </div>
          <div className="space-y-1.5">
            {todayItems.length === 0 ? (
              <p className="text-xs text-zinc-500">No tasks scheduled for today.</p>
            ) : (
              todayItems.slice(0, 3).map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleToggleEntry(item.id, item.completed)}
                  className="flex items-center gap-2 text-xs cursor-pointer hover:opacity-80 transition-opacity"
                >
                  {item.completed ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  ) : (
                    <Circle className="w-4 h-4 text-zinc-400 shrink-0" />
                  )}
                  <span
                    className={cn(
                      'truncate font-medium',
                      item.completed
                        ? 'line-through text-zinc-400 dark:text-zinc-500'
                        : 'text-zinc-800 dark:text-zinc-200'
                    )}
                  >
                    {item.title}
                  </span>
                </div>
              ))
            )}
            {todayItems.length > 3 && (
              <span className="text-[11px] font-medium text-amber-600 dark:text-amber-400">
                +{todayItems.length - 3} more items today
              </span>
            )}
          </div>
        </Card>

        {/* Metric 3: Revision Milestones */}
        <Card className="p-5 space-y-3 bg-gradient-to-br from-rose-500/5 to-transparent border-rose-500/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400">
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="text-xs font-bold uppercase tracking-wider">
                Revision Milestones
              </span>
            </div>
            <Badge variant="danger" size="sm">2 Blocks</Badge>
          </div>
          <div className="space-y-1.5 text-xs text-zinc-600 dark:text-zinc-400">
            <div className="flex items-center justify-between p-1.5 rounded-lg bg-rose-500/10 border border-rose-500/20">
              <span className="font-semibold text-rose-700 dark:text-rose-300">
                12 – 13 Sept: Block 1
              </span>
              <span className="text-[11px]">P&C, SOGA, BRS, TVM, IPA</span>
            </div>
            <div className="flex items-center justify-between p-1.5 rounded-lg bg-rose-500/10 border border-rose-500/20">
              <span className="font-semibold text-rose-700 dark:text-rose-300">
                19 – 20 Sept: Block 2
              </span>
              <span className="text-[11px]">Calculus, NPO, Final Accounts</span>
            </div>
          </div>
        </Card>
      </div>

      {/* 3. Subject Filter Pills */}
      <div className="flex items-center gap-2 text-xs overflow-x-auto no-scrollbar pb-1 max-w-full">
        <span className="text-zinc-500 font-semibold mr-1 flex items-center gap-1 shrink-0">
          <Filter className="w-3.5 h-3.5" /> Filter:
        </span>
        <button
          type="button"
          onClick={() => setSubjectFilter('all')}
          className={cn(
            'px-3 py-1.5 rounded-xl font-semibold transition-colors touch-target shrink-0',
            subjectFilter === 'all'
              ? 'bg-zinc-900 text-zinc-50 dark:bg-zinc-100 dark:text-zinc-900 shadow-sm'
              : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
          )}
        >
          All ({totalTasks})
        </button>
        <button
          type="button"
          onClick={() => setSubjectFilter('paper1')}
          className={cn(
            'px-3 py-1.5 rounded-xl font-semibold transition-colors touch-target flex items-center gap-1.5 shrink-0',
            subjectFilter === 'paper1'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
          )}
        >
          <span className="w-2 h-2 rounded-sm bg-emerald-500" />
          <span>Accounts (ACC)</span>
        </button>
        <button
          type="button"
          onClick={() => setSubjectFilter('paper2')}
          className={cn(
            'px-3 py-1.5 rounded-xl font-semibold transition-colors touch-target flex items-center gap-1.5 shrink-0',
            subjectFilter === 'paper2'
              ? 'bg-violet-600 text-white shadow-sm'
              : 'bg-violet-50 text-violet-700 dark:bg-violet-950/60 dark:text-violet-300 border border-violet-200 dark:border-violet-800'
          )}
        >
          <span className="w-2 h-2 rounded-sm bg-violet-500" />
          <span>Business Laws (BLAW)</span>
        </button>
        <button
          type="button"
          onClick={() => setSubjectFilter('paper3')}
          className={cn(
            'px-3 py-1.5 rounded-xl font-semibold transition-colors touch-target flex items-center gap-1.5 shrink-0',
            subjectFilter === 'paper3'
              ? 'bg-cyan-600 text-white shadow-sm'
              : 'bg-cyan-50 text-cyan-700 dark:bg-cyan-950/60 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800'
          )}
        >
          <span className="w-2 h-2 rounded-sm bg-cyan-500" />
          <span>Quantitative Aptitude (QA)</span>
        </button>
        <button
          type="button"
          onClick={() => setSubjectFilter('revision')}
          className={cn(
            'px-3 py-1.5 rounded-xl font-semibold transition-colors touch-target flex items-center gap-1.5 shrink-0',
            subjectFilter === 'revision'
              ? 'bg-rose-600 text-white shadow-sm'
              : 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
          )}
        >
          <span className="w-2 h-2 rounded-sm bg-rose-500" />
          <span>Revision Days</span>
        </button>
      </div>

      {/* 4. Main Body: Calendar or Agenda View */}
      {viewMode === 'calendar' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Calendar Grid (2 Cols on lg) */}
          <Card className="lg:col-span-2 p-4 sm:p-6 space-y-4">
            {/* Calendar Controls */}
            <div className="flex items-center justify-between pb-2 border-b border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">
                  {monthNames[currentMonth]} {currentYear}
                </h3>
                <button
                  type="button"
                  onClick={handleJumpToToday}
                  className="text-xs px-2 py-1 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 font-semibold"
                >
                  Today
                </button>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={handlePrevMonth}
                  className="p-2 rounded-xl text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                  aria-label="Previous Month"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={handleNextMonth}
                  className="p-2 rounded-xl text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                  aria-label="Next Month"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Weekday Header */}
            <div className="grid grid-cols-7 text-center text-xs font-bold text-zinc-400 py-1">
              <span>Sun</span>
              <span>Mon</span>
              <span>Tue</span>
              <span>Wed</span>
              <span>Thu</span>
              <span>Fri</span>
              <span>Sat</span>
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
              {calendarDays.map((day, idx) => {
                const isSelected = day.dateStr === selectedDate;
                const isToday = day.dateStr === today;
                const hasRevision = day.items.some((i) => i.isRevision);
                const hasItems = day.items.length > 0;
                const allDone = hasItems && day.items.every((i) => i.completed);

                return (
                  <button
                    key={`${day.dateStr}-${idx}`}
                    type="button"
                    onClick={() => {
                      setSelectedDate(day.dateStr);
                      if (typeof window !== 'undefined' && window.innerWidth < 1024) {
                        setTimeout(() => {
                          document.getElementById('selected-day-inspector')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                        }, 50);
                      }
                    }}
                    className={cn(
                      'min-h-[56px] sm:min-h-[90px] p-1 sm:p-2 rounded-xl sm:rounded-2xl flex flex-col justify-between text-left transition-all relative border touch-target',
                      day.isCurrentMonth
                        ? 'bg-zinc-50/70 dark:bg-zinc-900/40 text-zinc-800 dark:text-zinc-200'
                        : 'bg-zinc-100/30 dark:bg-zinc-900/10 text-zinc-400 dark:text-zinc-600 border-transparent',
                      isSelected
                        ? 'ring-2 ring-zinc-900 dark:ring-zinc-100 border-transparent shadow-md'
                        : isToday
                        ? 'border-amber-500/60 bg-amber-500/5'
                        : hasRevision
                        ? 'border-rose-500/40 bg-rose-500/5'
                        : hasItems
                        ? 'border-zinc-200/80 dark:border-zinc-800/80 hover:border-zinc-400'
                        : 'border-zinc-100 dark:border-zinc-900'
                    )}
                  >
                    {/* Day number & indicators */}
                    <div className="flex items-center justify-between w-full">
                      <span
                        className={cn(
                          'text-xs font-bold leading-none',
                          isToday && 'w-5 h-5 rounded-md bg-amber-500 text-white flex items-center justify-center -m-0.5'
                        )}
                      >
                        {day.dayNumber}
                      </span>
                      {allDone && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                      )}
                      {hasRevision && !allDone && (
                        <span className="text-[9px] font-extrabold uppercase text-rose-600 dark:text-rose-400">
                          Rev
                        </span>
                      )}
                    </div>

                    {/* Mobile: compact dot indicators */}
                    <div className="sm:hidden flex items-center justify-center gap-1 flex-wrap mt-0.5 w-full">
                      {day.items.slice(0, 3).map((item) => {
                        let dotColor = 'bg-zinc-400';
                        if (item.isRevision) dotColor = 'bg-rose-500';
                        else if (item.subjectId === 'paper1') dotColor = 'bg-emerald-500';
                        else if (item.subjectId === 'paper2') dotColor = 'bg-violet-500';
                        else if (item.subjectId === 'paper3') dotColor = 'bg-cyan-500';
                        else if (item.subjectId === 'paper4') dotColor = 'bg-amber-500';

                        return (
                          <span
                            key={item.id}
                            className={cn('w-1.5 h-1.5 rounded-xs shrink-0', dotColor, item.completed && 'opacity-40')}
                          />
                        );
                      })}
                      {day.items.length > 3 && (
                        <span className="text-[8px] font-bold text-zinc-500 tabular-nums">+{day.items.length - 3}</span>
                      )}
                    </div>

                    {/* Desktop: Task text micro-chips */}
                    <div className="hidden sm:block w-full space-y-1 mt-1">
                      {day.items.slice(0, 2).map((item) => {
                        let dotColor = 'bg-zinc-400';
                        if (item.isRevision) dotColor = 'bg-rose-500';
                        else if (item.subjectId === 'paper1') dotColor = 'bg-emerald-500';
                        else if (item.subjectId === 'paper2') dotColor = 'bg-violet-500';
                        else if (item.subjectId === 'paper3') dotColor = 'bg-cyan-500';
                        else if (item.subjectId === 'paper4') dotColor = 'bg-amber-500';

                        return (
                          <div
                            key={item.id}
                            className={cn(
                              'truncate text-[10px] px-1 py-0.5 rounded flex items-center gap-1',
                              item.completed
                                ? 'line-through opacity-50 bg-zinc-200/50 dark:bg-zinc-800/50'
                                : 'bg-white dark:bg-zinc-800 font-medium'
                            )}
                            title={item.title}
                          >
                            <span className={cn('w-1.5 h-1.5 rounded-xs shrink-0', dotColor)} />
                            <span className="truncate">{item.title}</span>
                          </div>
                        );
                      })}
                      {day.items.length > 2 && (
                        <span className="text-[9px] text-zinc-500 dark:text-zinc-400 font-medium pl-1 block">
                          +{day.items.length - 2} more
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </Card>

          {/* Day Inspector Drawer (1 Col on lg) */}
          <Card id="selected-day-inspector" className="p-4 sm:p-5 space-y-4 sticky top-20 border-zinc-200 dark:border-zinc-800 shadow-lg scroll-mt-20">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
              <div>
                <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                  Selected Day Plan
                </span>
                <h4 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                  {formatDate(selectedDate)}
                </h4>
              </div>
              {selectedDate === today && (
                <Badge variant="warning" size="sm">
                  Today
                </Badge>
              )}
            </div>

            {/* Day Items List */}
            {selectedDateItems.length === 0 ? (
              <div className="py-8 text-center space-y-2">
                <CalendarIcon className="w-8 h-8 text-zinc-300 dark:text-zinc-600 mx-auto" />
                <p className="text-xs text-zinc-500">
                  No syllabus items scheduled for this date.
                </p>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => {
                    setNewDate(selectedDate);
                    setShowAddModal(true);
                  }}
                  className="mt-2"
                >
                  <Plus className="w-3.5 h-3.5 mr-1" /> Add Task for {formatCompactDate(selectedDate)}
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-zinc-500">
                  <span>
                    {selectedDateItems.filter((i) => i.completed).length} / {selectedDateItems.length} completed
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setNewDate(selectedDate);
                      setShowAddModal(true);
                    }}
                    className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" /> Add item
                  </button>
                </div>

                <div className="space-y-2">
                  {selectedDateItems.map((item) => {
                    const subMeta = item.subjectId ? SUBJECT_METADATA_MAP[item.subjectId] : undefined;

                    return (
                      <div
                        key={item.id}
                        className={cn(
                          'p-3 rounded-2xl border transition-all space-y-2',
                          item.completed
                            ? 'bg-zinc-100/50 dark:bg-zinc-900/30 border-zinc-200/50 dark:border-zinc-800/50 opacity-75'
                            : item.isRevision
                            ? 'bg-rose-500/5 border-rose-500/20'
                            : 'bg-white dark:bg-zinc-800/80 border-zinc-200 dark:border-zinc-700/80 shadow-xs'
                        )}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <button
                            type="button"
                            onClick={() => handleToggleEntry(item.id, item.completed)}
                            className="mt-0.5 touch-target p-1 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 shrink-0"
                            aria-label={`Mark ${item.title} as ${item.completed ? 'pending' : 'completed'}`}
                          >
                            {item.completed ? (
                              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                            ) : (
                              <Circle className="w-5 h-5 text-zinc-400" />
                            )}
                          </button>

                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-1.5">
                              {subMeta && (
                                <span
                                  className={cn(
                                    'px-1.5 py-0.5 rounded text-[10px] font-bold uppercase',
                                    subMeta.color.bg
                                  )}
                                >
                                  {subMeta.code}
                                </span>
                              )}
                              {item.isRevision && (
                                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30">
                                  Revision
                                </span>
                              )}
                            </div>
                            <h5
                              className={cn(
                                'text-sm font-semibold mt-1 break-words',
                                item.completed
                                  ? 'line-through text-zinc-400 dark:text-zinc-500'
                                  : 'text-zinc-900 dark:text-zinc-100'
                              )}
                            >
                              {item.title}
                            </h5>
                            {item.chapterName && (
                              <p className="text-[11px] text-zinc-500 mt-0.5">
                                {item.chapterName}
                              </p>
                            )}
                            {item.notes && (
                              <p className="text-[11px] text-zinc-400 italic mt-1 bg-zinc-50 dark:bg-zinc-900/60 p-1.5 rounded-lg">
                                {item.notes}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </Card>
        </div>
      ) : (
        /* 5. Agenda / Timeline View */
        <div className="space-y-4">
          {groupedByDate.length === 0 ? (
            <Card className="text-center py-12 space-y-3">
              <CalendarIcon className="w-12 h-12 text-zinc-300 dark:text-zinc-600 mx-auto" />
              <h4 className="text-base font-semibold text-zinc-800 dark:text-zinc-200">
                No scheduled milestones found
              </h4>
              <p className="text-xs text-zinc-500">
                Try switching the subject filter or add a custom task.
              </p>
            </Card>
          ) : (
            groupedByDate.map(([dateStr, items]) => {
              const isToday = dateStr === today;
              const hasRevision = items.some((i) => i.isRevision);
              const allDone = items.length > 0 && items.every((i) => i.completed);

              return (
                <Card
                  key={dateStr}
                  className={cn(
                    'p-4 sm:p-6 space-y-4 transition-all',
                    isToday
                      ? 'border-amber-500/50 bg-amber-500/5 shadow-md'
                      : hasRevision
                      ? 'border-rose-500/30 bg-rose-500/5'
                      : 'border-zinc-200 dark:border-zinc-800'
                  )}
                >
                  {/* Day Banner Header */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-zinc-200/80 dark:border-zinc-800/80">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={cn(
                          'w-10 h-10 rounded-2xl flex flex-col items-center justify-center text-center font-bold shrink-0',
                          isToday
                            ? 'bg-amber-500 text-white shadow-sm'
                            : hasRevision
                            ? 'bg-rose-500 text-white shadow-sm'
                            : 'bg-zinc-900 text-zinc-100 dark:bg-zinc-100 dark:text-zinc-900'
                        )}
                      >
                        <span className="text-[10px] uppercase tracking-tighter leading-none">
                          {new Date(dateStr).toLocaleDateString('en-US', { month: 'short' })}
                        </span>
                        <span className="text-sm font-extrabold leading-none mt-0.5">
                          {parseInt(dateStr.split('-')[2], 10)}
                        </span>
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-base text-zinc-900 dark:text-zinc-50">
                            {formatDate(dateStr)}
                          </h4>
                          {isToday && (
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-amber-500 text-white shadow-xs">
                              Today
                            </span>
                          )}
                          {hasRevision && (
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30">
                              Revision Block
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-zinc-500">
                          {items.length} milestones planned
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-zinc-500 tabular-nums">
                        {items.filter((i) => i.completed).length}/{items.length} Done
                      </span>
                      {allDone && (
                        <Badge variant="completed" size="sm">
                          Completed
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Tasks for this day */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {items.map((item) => {
                      const subMeta = item.subjectId ? SUBJECT_METADATA_MAP[item.subjectId] : undefined;

                      return (
                        <div
                          key={item.id}
                          onClick={() => handleToggleEntry(item.id, item.completed)}
                          className={cn(
                            'p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 select-none',
                            item.completed
                              ? 'bg-zinc-100/60 dark:bg-zinc-900/40 border-zinc-200/60 dark:border-zinc-800/60 opacity-70'
                              : item.isRevision
                              ? 'bg-rose-500/10 border-rose-500/20 hover:bg-rose-500/15'
                              : 'bg-white dark:bg-zinc-800/80 border-zinc-200 dark:border-zinc-700/80 hover:bg-zinc-50 dark:hover:bg-zinc-800 shadow-xs'
                          )}
                        >
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleEntry(item.id, item.completed);
                            }}
                            className="mt-0.5 touch-target p-1 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 shrink-0"
                            aria-label={`Mark ${item.title}`}
                          >
                            {item.completed ? (
                              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                            ) : (
                              <Circle className="w-5 h-5 text-zinc-400" />
                            )}
                          </button>

                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-1.5 mb-1">
                              {subMeta && (
                                <span
                                  className={cn(
                                    'px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider',
                                    subMeta.color.bg
                                  )}
                                >
                                  {subMeta.code}
                                </span>
                              )}
                              {item.chapterName && (
                                <span className="text-[10px] font-semibold text-zinc-500 dark:text-zinc-400">
                                  {item.chapterName}
                                </span>
                              )}
                            </div>

                            <h5
                              className={cn(
                                'text-sm font-bold break-words',
                                item.completed
                                  ? 'line-through text-zinc-400 dark:text-zinc-500'
                                  : 'text-zinc-900 dark:text-zinc-100'
                              )}
                            >
                              {item.title}
                            </h5>

                            {item.notes && (
                              <p className="text-xs text-zinc-500 italic mt-1 bg-zinc-100/50 dark:bg-zinc-900/60 p-2 rounded-xl">
                                {item.notes}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </Card>
              );
            })
          )}
        </div>
      )}

      {/* 6. Add Custom Task Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <Card className="w-full max-w-lg p-6 space-y-4 bg-white dark:bg-zinc-900 shadow-2xl border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
              <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <Plus className="w-4 h-4 text-indigo-500" /> Add Task to Schedule
              </h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4">
              {addError && (
                <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 text-xs font-semibold">
                  {addError}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Task Title (as written in notes) *
                </label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Calculus, Part-I"
                  className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Scheduled Date *
                  </label>
                  <input
                    type="date"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 text-sm focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Subject Mapping
                  </label>
                  <select
                    value={newSubject}
                    onChange={(e) => setNewSubject(e.target.value as SubjectId | 'none')}
                    className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 text-sm focus:outline-none"
                  >
                    <option value="none">General / No Subject</option>
                    <option value="paper1">Paper 1: Accounting (ACC)</option>
                    <option value="paper2">Paper 2: Business Laws (BLAW)</option>
                    <option value="paper3">Paper 3: Quantitative Aptitude (QA)</option>
                    <option value="paper4">Paper 4: Business Economics (BECO)</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isRevisionCheckbox"
                  checked={newIsRevision}
                  onChange={(e) => setNewIsRevision(e.target.checked)}
                  className="rounded border-zinc-300 dark:border-zinc-700 text-rose-600 focus:ring-rose-500"
                />
                <label htmlFor="isRevisionCheckbox" className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 cursor-pointer">
                  Mark as Revision Day milestone
                </label>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Notes / Annotations (Optional)
                </label>
                <textarea
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="Additional focus areas, chapter numbers, etc."
                  rows={2}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 text-sm focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" size="sm">
                  Add to Schedule
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
};
