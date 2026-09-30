import React, { useState, useMemo } from 'react';
import {
  Search,
  CheckCircle2,
  Circle,
  Clock,
  ChevronDown,
  Plus,
  Calendar,
  BookOpen,
  FileText,
  ExternalLink,
  Play,
  Check,
} from 'lucide-react';
import { useData } from '@/context/DataContext';
import { Card } from '@/components/common/Card';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import { ProgressBar } from '@/components/common/ProgressBar';
import { SubjectId, TopicStatus, Topic, Chapter } from '@/types';
import { cn, formatMinutes, getTodayDateString, formatCompactDate } from '@/lib/utils';

export type DateFilter = 'all' | 'today' | 'overdue' | 'scheduled' | 'unscheduled';

export const ChecklistView: React.FC = () => {
  const { subjects, subjectGroups, updateTopicStatus, batchUpdateTopicStatus, updateTopic, addTopic } = useData();
  const [selectedSubject, setSelectedSubject] = useState<SubjectId | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<TopicStatus | 'all'>('all');
  const [dateFilter, setDateFilter] = useState<DateFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedChapters, setExpandedChapters] = useState<Record<string, boolean>>({});

  // Add custom modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [customTitle, setCustomTitle] = useState('');
  const [customSubject, setCustomSubject] = useState<SubjectId>('paper1');
  const [customChapterName, setCustomChapterName] = useState('');
  const [customEstHours, setCustomEstHours] = useState('1.0');
  const [customTargetDate, setCustomTargetDate] = useState('');
  const [customValidationError, setCustomValidationError] = useState('');

  // Target date picker modal on existing topic
  const [editingTopicDate, setEditingTopicDate] = useState<Topic | null>(null);
  const [newTargetDateValue, setNewTargetDateValue] = useState('');

  const today = getTodayDateString();

  const toggleChapter = (chId: string) => {
    setExpandedChapters((prev) => ({
      ...prev,
      [chId]: !prev[chId],
    }));
  };

  const handleExpandAll = () => {
    const allExpanded: Record<string, boolean> = {};
    Object.values(subjectGroups).forEach((group) => {
      group.chapters.forEach((ch) => {
        allExpanded[ch.id] = true;
      });
    });
    setExpandedChapters(allExpanded);
  };

  const handleCollapseAll = () => {
    const allCollapsed: Record<string, boolean> = {};
    Object.values(subjectGroups).forEach((group) => {
      group.chapters.forEach((ch) => {
        allCollapsed[ch.id] = false;
      });
    });
    setExpandedChapters(allCollapsed);
  };

  const handleNextStatus = (topicId: string, currentStatus: TopicStatus) => {
    let nextStatus: TopicStatus = 'in_progress';
    if (currentStatus === 'pending') nextStatus = 'in_progress';
    else if (currentStatus === 'in_progress') nextStatus = 'completed';
    else nextStatus = 'pending';
    updateTopicStatus(topicId, nextStatus);
  };

  const handleToggleChapter = async (chapter: Chapter) => {
    const totalCount = chapter.totalTopicsCount ?? chapter.topics.length;
    const completedCount = chapter.completedTopicsCount ?? 0;
    const isAllComplete = totalCount > 0 && completedCount === totalCount;
    const targetStatus: TopicStatus = isAllComplete ? 'pending' : 'completed';
    const topicIds = chapter.topics.map((t) => t.id);
    if (batchUpdateTopicStatus) {
      await batchUpdateTopicStatus(topicIds, targetStatus);
    } else {
      topicIds.forEach((id) => updateTopicStatus(id, targetStatus));
    }
  };

  const handleSaveTopicDate = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingTopicDate) {
      updateTopic(editingTopicDate.id, {
        targetDate: newTargetDateValue || undefined,
      });
      setEditingTopicDate(null);
      setNewTargetDateValue('');
    }
  };

  const handleCreateCustomTopic = (e: React.FormEvent) => {
    e.preventDefault();
    setCustomValidationError('');
    const trimmedTitle = customTitle.trim();
    if (!trimmedTitle) {
      setCustomValidationError('Please enter a topic title.');
      return;
    }
    const hours = parseFloat(customEstHours);
    if (isNaN(hours) || hours <= 0) {
      setCustomValidationError('Please enter a valid positive study duration.');
      return;
    }

    const chapterId = customChapterName.trim()
      ? `${customSubject}-ch-${customChapterName.trim().toLowerCase().replace(/[^a-z0-9]/g, '-')}`
      : `${customSubject}-custom`;

    addTopic({
      title: trimmedTitle,
      subjectId: customSubject,
      chapterId,
      chapterName: customChapterName.trim() || 'Custom Modules',
      status: 'pending',
      estimatedMinutes: Math.round(hours * 60),
      estimatedHours: hours,
      targetDate: customTargetDate || undefined,
      isCustom: true,
    });

    setExpandedChapters((prev) => ({
      ...prev,
      [chapterId]: true,
    }));

    setCustomTitle('');
    setCustomChapterName('');
    setCustomEstHours('1.0');
    setCustomTargetDate('');
    setShowAddModal(false);
  };

  // Filter groups
  const filteredSubjects = useMemo(() => {
    const paperKeys: SubjectId[] =
      selectedSubject === 'all'
        ? ['paper1', 'paper2', 'paper3', 'paper4']
        : [selectedSubject];

    // Split search query into multi-keywords (tokenized)
    const tokens = searchQuery
      .toLowerCase()
      .trim()
      .split(/\s+/)
      .filter(Boolean);

    return paperKeys
      .map((pId) => {
        const group = subjectGroups[pId];
        if (!group) return null;

        const filteredChapters = group.chapters
          .map((ch) => {
            const matchingTopics = ch.topics.filter((top) => {
              // Status filter
              const matchesStatus = statusFilter === 'all' || top.status === statusFilter;

              // Date filter
              let matchesDate = true;
              if (dateFilter === 'today') {
                matchesDate = top.targetDate === today;
              } else if (dateFilter === 'overdue') {
                matchesDate = Boolean(top.targetDate && top.targetDate < today && top.status !== 'completed');
              } else if (dateFilter === 'scheduled') {
                matchesDate = Boolean(top.targetDate);
              } else if (dateFilter === 'unscheduled') {
                matchesDate = !top.targetDate;
              }

              // Multi-keyword token search
              let matchesQuery = true;
              if (tokens.length > 0) {
                const targetText = `${top.title} ${ch.title} ${top.notes || ''} ${(
                  top.learningObjectives || []
                ).join(' ')}`.toLowerCase();

                matchesQuery = tokens.every((token) => targetText.includes(token));
              }

              return matchesStatus && matchesDate && matchesQuery;
            });

            return {
              ...ch,
              topics: matchingTopics,
            };
          })
          .filter((ch) => ch.topics.length > 0);

        return {
          ...group,
          chapters: filteredChapters,
        };
      })
      .filter(Boolean);
  }, [selectedSubject, statusFilter, dateFilter, searchQuery, subjectGroups, today]);

  const totalMatchingTopics = filteredSubjects.reduce(
    (acc, sub) =>
      acc + (sub?.chapters.reduce((sum, ch) => sum + ch.topics.length, 0) || 0),
    0
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Controls Bar: Subject Pills, Search & Actions */}
      <div className="space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Subject Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 max-w-full">
            <button
              type="button"
              onClick={() => setSelectedSubject('all')}
              className={cn(
                'px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors touch-target',
                selectedSubject === 'all'
                  ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-sm'
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
              )}
            >
              All Papers (4)
            </button>
            {subjects.map((sub) => (
              <button
                key={sub.id}
                type="button"
                onClick={() => setSelectedSubject(sub.id)}
                className={cn(
                  'px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors touch-target',
                  selectedSubject === sub.id
                    ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-sm'
                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                )}
              >
                {sub.code} - {sub.shortName}
              </button>
            ))}
          </div>

          {/* Search Bar & Action Buttons */}
          <div className="flex items-center gap-2 w-full lg:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <input
                type="text"
                placeholder="Search topics, chapters..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-500"
              />
            </div>

            <Button
              size="sm"
              variant="primary"
              leftIcon={<Plus className="w-4 h-4" />}
              onClick={() => setShowAddModal(true)}
            >
              Add Topic
            </Button>
          </div>
        </div>

        {/* Sub-Filters: Status & Due Date Filter */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-zinc-200/60 dark:border-zinc-800/60 pt-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-zinc-500 font-medium">Status:</span>
            {(['all', 'pending', 'in_progress', 'completed'] as const).map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                className={cn(
                  'px-2.5 py-1 rounded-lg text-xs font-medium transition-colors',
                  statusFilter === st
                    ? 'bg-zinc-200 dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 font-semibold'
                    : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'
                )}
              >
                {st === 'all'
                  ? 'All'
                  : st === 'in_progress'
                  ? 'In Progress'
                  : st.charAt(0).toUpperCase() + st.slice(1)}
              </button>
            ))}

            <span className="text-zinc-300 dark:text-zinc-700 mx-1">|</span>

            <span className="text-xs text-zinc-500 font-medium">Schedule:</span>
            {(
              [
                { id: 'all', label: 'All' },
                { id: 'today', label: 'Due Today' },
                { id: 'overdue', label: 'Overdue' },
                { id: 'scheduled', label: 'Scheduled' },
                { id: 'unscheduled', label: 'Unscheduled' },
              ] as const
            ).map((d) => (
              <button
                key={d.id}
                type="button"
                onClick={() => setDateFilter(d.id)}
                className={cn(
                  'px-2.5 py-1 rounded-lg text-xs font-medium transition-colors',
                  dateFilter === d.id
                    ? 'bg-zinc-200 dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 font-semibold'
                    : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'
                )}
              >
                {d.label}
              </button>
            ))}
          </div>

          {/* Expand / Collapse Controls */}
          <div className="flex items-center gap-2 text-xs text-zinc-500">
            <span>{totalMatchingTopics} topics</span>
            <span>•</span>
            <button
              type="button"
              onClick={handleExpandAll}
              className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
            >
              Expand All
            </button>
            <span>/</span>
            <button
              type="button"
              onClick={handleCollapseAll}
              className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
            >
              Collapse All
            </button>
          </div>
        </div>
      </div>

      {/* Hierarchical Syllabus Tree */}
      <div className="space-y-6">
        {totalMatchingTopics === 0 ? (
          <Card className="text-center py-12 space-y-3">
            <div className="w-12 h-12 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-400 flex items-center justify-center mx-auto">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 text-sm">
              No matching topics found
            </h3>
            <p className="text-xs text-zinc-500 max-w-sm mx-auto">
              Try adjusting your search query, clearing filters, or adding a new custom topic.
            </p>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('all');
                setDateFilter('all');
                setSelectedSubject('all');
              }}
            >
              Clear All Filters
            </Button>
          </Card>
        ) : (
          filteredSubjects.map((subGroup) => {
            if (!subGroup || subGroup.chapters.length === 0) return null;

            return (
              <div key={subGroup.meta.id} className="space-y-3">
                {/* Paper Section Title */}
                <div className="flex items-center justify-between py-2 border-b border-zinc-200 dark:border-zinc-800">
                  <div className="flex items-center gap-2">
                    <Badge variant={subGroup.meta.id} size="sm">
                      {subGroup.meta.code}
                    </Badge>
                    <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100">
                      {subGroup.meta.name}
                    </h3>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 tabular-nums">
                      {subGroup.completedTopics} / {subGroup.totalTopics} Done (
                      {subGroup.progressPercentage}%)
                    </span>
                    <div className="w-24 hidden sm:block">
                      <ProgressBar
                        value={subGroup.progressPercentage}
                        subjectId={subGroup.meta.id}
                        size="sm"
                      />
                    </div>
                  </div>
                </div>

                {/* Chapters list */}
                <div className="space-y-2.5">
                  {subGroup.chapters.map((chapter) => {
                    const hasSubunits = Boolean(chapter.hasSubunits ?? (chapter.topics.length > 1));
                    const isExpanded = Boolean(expandedChapters[chapter.id]);
                    const totalCount = chapter.totalTopicsCount ?? chapter.topics.length;
                    const completedCount = chapter.completedTopicsCount ?? 0;
                    const isChapterCompleted = totalCount > 0 && completedCount === totalCount;
                    const isChapterInProgress = completedCount > 0 && !isChapterCompleted;
                    const scheduledDates = Array.from(
                      new Set(
                        chapter.topics
                          .map((t) => t.targetDate)
                          .filter((d): d is string => Boolean(d))
                      )
                    ).sort();

                    return (
                      <Card
                        key={chapter.id}
                        className={cn(
                          'p-0 overflow-hidden transition-all',
                          isChapterCompleted && 'border-l-4 border-l-emerald-500 bg-emerald-50/10 dark:bg-emerald-950/10'
                        )}
                      >
                        {/* Chapter Accordion Header Row */}
                        <div
                          className={cn(
                            'w-full flex flex-col sm:flex-row sm:items-center justify-between transition-colors text-left select-none p-2.5 sm:p-3 gap-2',
                            isChapterCompleted
                              ? 'bg-emerald-50/30 dark:bg-emerald-950/20'
                              : 'bg-zinc-50/60 dark:bg-zinc-900/40'
                          )}
                        >
                          {/* Left: Status Toggle + Accordion Title Button */}
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            {/* 1-Tap Chapter Completion Toggle Button */}
                            <button
                              type="button"
                              onClick={() => handleToggleChapter(chapter)}
                              className="touch-target p-1.5 rounded-md text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors shrink-0 min-h-[44px] min-w-[44px] flex items-center justify-center"
                              title={
                                isChapterCompleted
                                  ? 'Chapter completed. Click to mark all units as pending.'
                                  : 'Click to mark entire chapter as completed.'
                              }
                              aria-label={
                                isChapterCompleted
                                  ? `Toggle status for: Mark chapter ${chapter.title} as pending`
                                  : `Toggle status for: Mark chapter ${chapter.title} as completed`
                              }
                            >
                              {isChapterCompleted ? (
                                <CheckCircle2 className="w-5 h-5 text-emerald-500 fill-emerald-500/10" />
                              ) : isChapterInProgress ? (
                                <Clock className="w-5 h-5 text-blue-500" />
                              ) : (
                                <Circle className="w-5 h-5 text-zinc-300 dark:text-zinc-600 hover:text-zinc-400" />
                              )}
                            </button>

                            {/* Accordion Expand/Collapse Button containing Chapter Title */}
                            <button
                              type="button"
                              onClick={() => toggleChapter(chapter.id)}
                              aria-expanded={isExpanded}
                              className="flex-1 flex items-center gap-2.5 text-left py-1 px-1 rounded-md hover:bg-zinc-100/50 dark:hover:bg-zinc-800/50 transition-colors min-w-0 cursor-pointer min-h-[44px]"
                            >
                              <div
                                className="p-1 rounded-md text-zinc-400 shrink-0"
                                title={isExpanded ? 'Collapse chapter units' : 'Expand chapter units'}
                              >
                                <ChevronDown
                                  className={cn(
                                    'w-4 h-4 transition-transform duration-200',
                                    isExpanded ? 'rotate-180 text-zinc-600 dark:text-zinc-300' : 'text-zinc-400'
                                  )}
                                />
                              </div>

                              <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                                  <span
                                    className={cn(
                                      'text-xs font-semibold',
                                      isChapterCompleted
                                        ? 'text-emerald-600 dark:text-emerald-400'
                                        : 'text-zinc-500 dark:text-zinc-400'
                                    )}
                                  >
                                    Ch {chapter.chapterNumber}:
                                  </span>
                                  <h4
                                    className={cn(
                                      'font-semibold text-sm',
                                      isChapterCompleted
                                        ? 'text-zinc-900 dark:text-zinc-100 font-bold'
                                        : 'text-zinc-900 dark:text-zinc-100'
                                    )}
                                  >
                                    {chapter.title}
                                  </h4>
                                  {hasSubunits && chapter.topics.length > 1 ? (
                                    <Badge variant="outline" size="sm">
                                      {chapter.topics.length} Units
                                    </Badge>
                                  ) : (
                                    <Badge variant="outline" size="sm">
                                      Single Chapter
                                    </Badge>
                                  )}
                                  {isChapterCompleted && (
                                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-100/80 dark:bg-emerald-950/80 px-2 py-0.5 rounded-md border border-emerald-300/80 dark:border-emerald-800/80 shrink-0">
                                      <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" /> Completed
                                    </span>
                                  )}
                                  {chapter.icaiWeightage && (
                                    <Badge variant="outline" size="sm">
                                      {chapter.icaiWeightage.typicalMarks}
                                    </Badge>
                                  )}
                                  {scheduledDates.length > 0 && (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-800/80">
                                      <Calendar className="w-3 h-3 text-indigo-500 shrink-0" />
                                      <span>{scheduledDates.map((d) => formatCompactDate(d)).join(', ')}</span>
                                    </span>
                                  )}
                                </div>
                              </div>
                            </button>
                          </div>

                          {/* Right: Lecture, PDF & Progress */}
                          <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-3 shrink-0 pt-1.5 sm:pt-0 border-t sm:border-t-0 border-zinc-200/50 dark:border-zinc-800/50 pl-2">
                            <div className="flex items-center gap-1.5">
                              {chapter.videoUrl && (
                                <a
                                  href={chapter.videoUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-red-50 text-red-700 dark:bg-red-950/70 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/80 transition-colors border border-red-200 dark:border-red-800/80 shrink-0 touch-target min-h-[36px]"
                                  title={chapter.videoTitle ? `Watch Lecture: ${chapter.videoTitle}` : `Watch Lecture for Chapter ${chapter.chapterNumber}`}
                                >
                                  <Play className="w-3.5 h-3.5 text-red-600 dark:text-red-400 fill-current" />
                                  <span className="hidden xs:inline font-semibold">Lecture</span>
                                  <ExternalLink className="w-3 h-3 opacity-70" />
                                </a>
                              )}
                              {chapter.pdfUrl && (
                                <a
                                  href={chapter.pdfUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-blue-50 text-blue-700 dark:bg-blue-950/70 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/80 transition-colors border border-blue-200 dark:border-blue-800/80 shrink-0 touch-target min-h-[36px]"
                                  title={`Open official ICAI Study Material for Chapter ${chapter.chapterNumber}`}
                                >
                                  <BookOpen className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                                  <span className="hidden xs:inline font-semibold">ICAI PDF</span>
                                  <ExternalLink className="w-3 h-3 opacity-70" />
                                </a>
                              )}
                            </div>
                            <div className="flex items-center gap-1.5 text-xs font-medium tabular-nums ml-auto sm:ml-0">
                              <span
                                className={cn(
                                  'font-semibold',
                                  isChapterCompleted
                                    ? 'text-emerald-600 dark:text-emerald-400'
                                    : 'text-zinc-500'
                                )}
                              >
                                {chapter.completedTopicsCount} / {chapter.totalTopicsCount}
                              </span>
                              {isChapterCompleted && (
                                <span
                                  className="p-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800 shrink-0"
                                  title="Chapter completed"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Subunit Rows */}
                        {isExpanded && (
                          <div className="divide-y divide-zinc-100 dark:divide-zinc-800/60 p-2">
                            {chapter.topics.map((topic) => {
                              const isOverdue =
                                topic.targetDate &&
                                topic.targetDate < today &&
                                topic.status !== 'completed';

                              return (
                                <div
                                  key={topic.id}
                                  className="p-2.5 sm:p-3 flex flex-col sm:flex-row sm:items-center justify-between rounded-xl hover:bg-zinc-100/60 dark:hover:bg-zinc-800/60 transition-colors gap-2.5 sm:gap-3"
                                >
                                  <div className="flex items-start gap-2.5 sm:gap-3 min-w-0 flex-1">
                                    {/* 1-Tap Toggle Icon */}
                                    <button
                                      type="button"
                                      onClick={() => handleNextStatus(topic.id, topic.status)}
                                      className="mt-0.5 touch-target p-1 rounded-md text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors shrink-0 min-h-[44px] min-w-[44px] flex items-center justify-center"
                                      title={`Status: ${topic.status}. Click to cycle status.`}
                                      aria-label={`Toggle status for ${topic.title}`}
                                    >
                                      {topic.status === 'completed' ? (
                                        <CheckCircle2 className="w-5 h-5 text-emerald-500 fill-emerald-500/10" />
                                      ) : topic.status === 'in_progress' ? (
                                        <Clock className="w-5 h-5 text-blue-500" />
                                      ) : (
                                        <Circle className="w-5 h-5 text-zinc-300 dark:text-zinc-600" />
                                      )}
                                    </button>

                                    <div className="min-w-0 flex-1">
                                      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                                        <span
                                          className={cn(
                                            'text-sm font-medium transition-colors break-words',
                                            topic.status === 'completed'
                                              ? 'line-through text-zinc-400 dark:text-zinc-500'
                                              : 'text-zinc-800 dark:text-zinc-200'
                                          )}
                                        >
                                          {topic.title}
                                        </span>
                                        {topic.targetDate && (
                                          <span
                                            className={cn(
                                              'inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold border transition-all select-none shrink-0',
                                              topic.status === 'completed'
                                                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-300/80 dark:border-emerald-800/80'
                                                : topic.targetDate === today
                                                ? 'bg-amber-500/15 text-amber-800 dark:text-amber-200 border-amber-500/40 ring-1 ring-amber-500/30'
                                                : isOverdue
                                                ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border-rose-300/80 dark:border-rose-800/80'
                                                : 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800/80'
                                            )}
                                            title={`Scheduled target date: ${topic.targetDate}`}
                                          >
                                            <Calendar className="w-3 h-3 shrink-0" />
                                            <span>{formatCompactDate(topic.targetDate)}</span>
                                            {topic.targetDate === today && (
                                              <span className="text-[9px] font-bold uppercase bg-amber-500 text-white dark:text-zinc-950 px-1 py-0.2 rounded ml-0.5">
                                                Today
                                              </span>
                                            )}
                                          </span>
                                        )}
                                        {topic.isCustom && (
                                          <Badge variant="outline" size="sm">
                                            Custom
                                          </Badge>
                                        )}
                                        {isOverdue && (
                                          <Badge variant="danger" size="sm">
                                            Overdue
                                          </Badge>
                                        )}
                                      </div>

                                      <div className="flex flex-wrap items-center gap-2 text-[11px] text-zinc-400 mt-1">
                                        <span>{formatMinutes(topic.estimatedMinutes ?? 60)}</span>
                                        {topic.targetDate && (
                                          <span>• Scheduled: {formatCompactDate(topic.targetDate)} ({topic.targetDate})</span>
                                        )}
                                        {topic.completedAt && (
                                          <span>
                                            • Completed {topic.completedAt.split('T')[0]}
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  </div>

                                  <div className="flex items-center justify-between sm:justify-end gap-1.5 sm:gap-2 shrink-0 w-full sm:w-auto pt-1.5 sm:pt-0 border-t sm:border-t-0 border-zinc-100 dark:border-zinc-800/40">
                                    <div className="flex items-center gap-1.5">
                                      {/* Direct Video Lecture Link */}
                                      {topic.videoUrl && (
                                        <a
                                          href={topic.videoUrl}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="p-1.5 rounded-md text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/60 transition-colors inline-flex items-center gap-1 touch-target min-h-[36px]"
                                          title={topic.videoTitle ? `Watch Lecture: ${topic.videoTitle}` : 'Watch YouTube Lecture'}
                                        >
                                          <Play className="w-3.5 h-3.5 fill-current" />
                                          <span className="text-[11px] font-medium">Lecture</span>
                                          <ExternalLink className="w-3 h-3 opacity-70" />
                                        </a>
                                      )}

                                      {/* Direct PDF Link */}
                                      {topic.pdfUrl && (
                                        <a
                                          href={topic.pdfUrl}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="p-1.5 rounded-md text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/60 transition-colors inline-flex items-center gap-1 touch-target min-h-[36px]"
                                          title={topic.pdfTitle ? `Open ICAI PDF: ${topic.pdfTitle}` : 'Open ICAI Study Material PDF'}
                                        >
                                          <FileText className="w-3.5 h-3.5" />
                                          <span className="text-[11px] font-medium">PDF</span>
                                          <ExternalLink className="w-3 h-3 opacity-70" />
                                        </a>
                                      )}

                                      {/* Date editor button */}
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setEditingTopicDate(topic);
                                          setNewTargetDateValue(topic.targetDate || '');
                                        }}
                                        className="p-1.5 rounded-md text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-200/50 dark:hover:bg-zinc-700/50 transition-colors touch-target min-h-[36px] min-w-[36px] flex items-center justify-center"
                                        title="Set Target Date"
                                      >
                                        <Calendar className="w-4 h-4" />
                                      </button>
                                    </div>

                                    {/* 1-Tap Status Pill */}
                                    <button
                                      type="button"
                                      onClick={() => handleNextStatus(topic.id, topic.status)}
                                      className="focus:outline-none touch-target"
                                    >
                                      <Badge variant={topic.status} size="sm">
                                        {topic.status === 'in_progress'
                                          ? 'In Progress'
                                          : topic.status.charAt(0).toUpperCase() +
                                            topic.status.slice(1)}
                                      </Badge>
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </Card>
                    );
                  })}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add Custom Topic Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <Card className="w-full max-w-md p-6 space-y-4">
            <div className="flex items-center gap-2">
              <Plus className="w-5 h-5 text-emerald-500" />
              <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                Add Custom Topic or Module
              </h3>
            </div>

            {customValidationError && (
              <div className="p-2.5 rounded-xl bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs">
                {customValidationError}
              </div>
            )}

            <form onSubmit={handleCreateCustomTopic} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Subject Paper
                </label>
                <select
                  value={customSubject}
                  onChange={(e) => setCustomSubject(e.target.value as SubjectId)}
                  className="w-full p-2.5 text-xs rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100"
                >
                  {subjects.map((sub) => (
                    <option key={sub.id} value={sub.id}>
                      {sub.code} - {sub.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Chapter / Section Name (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. RTP Practice Nov 2024 / MTP Series"
                  value={customChapterName}
                  onChange={(e) => setCustomChapterName(e.target.value)}
                  className="w-full p-2.5 text-xs rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Topic Title *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Partnership Dissolution Advanced Sums"
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  className="w-full p-2.5 text-xs rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100"
                  required
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    Est. Study Hours
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="0.1"
                    value={customEstHours}
                    onChange={(e) => setCustomEstHours(e.target.value)}
                    className="w-full p-2.5 text-xs rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    Target Date
                  </label>
                  <input
                    type="date"
                    value={customTargetDate}
                    onChange={(e) => setCustomTargetDate(e.target.value)}
                    className="w-full p-2 text-xs rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm">
                  Add to Checklist
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Target Date Picker Modal */}
      {editingTopicDate && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <Card className="w-full max-w-sm p-6 space-y-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-zinc-700 dark:text-zinc-300" />
              <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                Set Target Date
              </h3>
            </div>
            <p className="text-xs text-zinc-500 truncate">{editingTopicDate.title}</p>
            <form onSubmit={handleSaveTopicDate} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Target Completion Date
                </label>
                <input
                  type="date"
                  value={newTargetDateValue}
                  onChange={(e) => setNewTargetDateValue(e.target.value)}
                  className="w-full p-2.5 text-xs rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setEditingTopicDate(null);
                    setNewTargetDateValue('');
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    updateTopic(editingTopicDate.id, { targetDate: undefined });
                    setEditingTopicDate(null);
                  }}
                >
                  Clear Date
                </Button>
                <Button type="submit" variant="primary" size="sm">
                  Save
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
};
