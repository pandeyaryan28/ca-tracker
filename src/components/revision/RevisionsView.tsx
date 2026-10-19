import React, { useState, useMemo } from 'react';
import {
  RotateCw,
  CheckCircle2,
  AlertCircle,
  FileEdit,
  Plus,
  Trash2,
  X,
} from 'lucide-react';
import { useData } from '@/context/DataContext';
import { Card } from '@/components/common/Card';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import { ConfidenceLevel, RevisionRecord } from '@/types';
import { formatDate, getTodayDateString, calculateNextRevisionDate, cn } from '@/lib/utils';

export const RevisionsView: React.FC = () => {
  const {
    revisions,
    advanceRevisionCycle,
    deleteRevision,
    updateRevision,
    addRevision,
    topics,
  } = useData();

  const [selectedConfidence, setSelectedConfidence] = useState<Record<string, ConfidenceLevel>>({});
  const [cycleFilter, setCycleFilter] = useState<'all' | 1 | 2 | 3>('all');
  const [dueFilter, setDueFilter] = useState<'all' | 'due_today' | 'overdue' | 'upcoming'>('all');

  // Mistake Notebook Modal state
  const [editingNotesRev, setEditingNotesRev] = useState<RevisionRecord | null>(null);
  const [noteContent, setNoteContent] = useState('');

  // Add Manual Revision Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [manualTopicId, setManualTopicId] = useState('');
  const [manualConfidence, setManualConfidence] = useState<ConfidenceLevel>('medium');

  const today = getTodayDateString();

  const handleAdvance = (topicId: string, revId: string) => {
    const confidence = selectedConfidence[revId] || 'medium';
    advanceRevisionCycle(topicId, confidence);
  };

  const handleOpenNotes = (rev: RevisionRecord) => {
    setEditingNotesRev(rev);
    setNoteContent(rev.mistakesNotes || '');
  };

  const handleSaveNotes = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingNotesRev) {
      updateRevision(editingNotesRev.id, {
        mistakesNotes: noteContent.trim() || undefined,
      });
      setEditingNotesRev(null);
      setNoteContent('');
    }
  };

  const handleAddManualRevision = (e: React.FormEvent) => {
    e.preventDefault();
    const topic = topics.find((t) => t.id === manualTopicId);
    if (!topic) return;

    const nextDate = calculateNextRevisionDate(today, 1, manualConfidence);
    addRevision({
      topicId: topic.id,
      topicTitle: topic.title,
      chapterId: topic.chapterId,
      chapterName: topic.chapterName,
      subjectId: topic.subjectId,
      cycle: 1,
      lastRevisedDate: today,
      nextTargetDate: nextDate,
      confidence: manualConfidence,
    });

    setManualTopicId('');
    setShowAddModal(false);
  };

  // Filtered Revisions
  const filteredRevisions = useMemo(() => {
    return revisions.filter((rev) => {
      // Cycle Filter
      let matchesCycle = true;
      if (cycleFilter === 1) matchesCycle = rev.cycle === 1;
      else if (cycleFilter === 2) matchesCycle = rev.cycle === 2;
      else if (cycleFilter === 3) matchesCycle = rev.cycle >= 3;

      // Due Filter
      let matchesDue = true;
      if (dueFilter === 'due_today') {
        matchesDue = rev.nextTargetDate === today;
      } else if (dueFilter === 'overdue') {
        matchesDue = Boolean(rev.nextTargetDate && rev.nextTargetDate < today);
      } else if (dueFilter === 'upcoming') {
        matchesDue = Boolean(rev.nextTargetDate && rev.nextTargetDate > today);
      }

      return matchesCycle && matchesDue;
    });
  }, [revisions, cycleFilter, dueFilter, today]);

  // Statistics
  const dueTodayCount = revisions.filter((r) => r.nextTargetDate === today).length;
  const overdueCount = revisions.filter((r) => r.nextTargetDate < today).length;
  const notesCount = revisions.filter((r) => r.mistakesNotes && r.mistakesNotes.trim().length > 0).length;

  return (
    <div className="space-y-6 animate-fade-in max-w-7xl mx-auto pb-16">
      {/* Header & Action — Apple Liquid Glass Command Card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 p-6 sm:p-7 rounded-3xl border border-white/20 dark:border-white/10 bg-white/80 dark:bg-zinc-900/70 backdrop-blur-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_12px_40px_rgb(0,0,0,0.45)]">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-500/30">
              Retention Architecture
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            Spaced Repetition & Mistake Notebook
          </h2>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
            Intelligent spaced review schedule ($R_1 \to R_2 \to R_3+$ with confidence intervals)
          </p>
        </div>

        <Button
          size="sm"
          variant="primary"
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={() => setShowAddModal(true)}
          className="rounded-full bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-sm swiftui-press active:scale-[0.98] font-semibold"
        >
          Add Revision Queue
        </Button>
      </div>

      {/* KPI Stats — Apple Squircle Glass Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="space-y-1.5 p-5 rounded-2xl border border-zinc-200/60 dark:border-zinc-800/60 bg-white/70 dark:bg-zinc-900/60 backdrop-blur-xl shadow-sm">
          <span className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">Active Revisions</span>
          <div className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 tabular-nums">
            {revisions.length}
          </div>
        </Card>

        <Card className="space-y-1.5 p-5 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 dark:bg-emerald-500/10 backdrop-blur-xl shadow-sm">
          <span className="text-xs text-emerald-700 dark:text-emerald-300 uppercase tracking-wider font-semibold">Due Today</span>
          <div className="text-2xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400 tabular-nums">
            {dueTodayCount}
          </div>
        </Card>

        <Card className="space-y-1.5 p-5 rounded-2xl border border-rose-500/20 bg-rose-500/5 dark:bg-rose-500/10 backdrop-blur-xl shadow-sm">
          <span className="text-xs text-rose-700 dark:text-rose-300 uppercase tracking-wider font-semibold">Overdue Reviews</span>
          <div className="text-2xl font-bold tracking-tight text-rose-600 dark:text-rose-400 tabular-nums">
            {overdueCount}
          </div>
        </Card>

        <Card className="space-y-1.5 p-5 rounded-2xl border border-amber-500/20 bg-amber-500/5 dark:bg-amber-500/10 backdrop-blur-xl shadow-sm">
          <span className="text-xs text-amber-700 dark:text-amber-300 uppercase tracking-wider font-semibold">Mistake Notes</span>
          <div className="text-2xl font-bold tracking-tight text-amber-600 dark:text-amber-400 tabular-nums">
            {notesCount}
          </div>
        </Card>
      </div>

      {/* Filter Tabs — Apple Segmented Pill Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="inline-flex items-center gap-1.5 p-1.5 rounded-full bg-zinc-200/50 dark:bg-zinc-800/50 backdrop-blur-md border border-zinc-300/40 dark:border-zinc-700/40 overflow-x-auto max-w-full">
          <span className="text-xs text-zinc-500 dark:text-zinc-400 font-semibold px-2 shrink-0">Cycle:</span>
          {(
            [
              { id: 'all', label: 'All Cycles' },
              { id: 1, label: 'R1 (+3d)' },
              { id: 2, label: 'R2 (+7d)' },
              { id: 3, label: 'R3+ (+14d)' },
            ] as const
          ).map((item) => (
            <button
              key={String(item.id)}
              type="button"
              onClick={() => setCycleFilter(item.id as any)}
              className={cn(
                'px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all shrink-0 swiftui-press active:scale-[0.98]',
                cycleFilter === item.id
                  ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-sm border border-zinc-200/60 dark:border-zinc-700/60'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
              )}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="inline-flex items-center gap-1.5 p-1.5 rounded-full bg-zinc-200/50 dark:bg-zinc-800/50 backdrop-blur-md border border-zinc-300/40 dark:border-zinc-700/40 overflow-x-auto max-w-full">
          <span className="text-xs text-zinc-500 dark:text-zinc-400 font-semibold px-2 shrink-0">Due:</span>
          {(
            [
              { id: 'all', label: 'All' },
              { id: 'due_today', label: 'Due Today' },
              { id: 'overdue', label: 'Overdue' },
              { id: 'upcoming', label: 'Upcoming' },
            ] as const
          ).map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setDueFilter(item.id as any)}
              className={cn(
                'px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all shrink-0 swiftui-press active:scale-[0.98]',
                dueFilter === item.id
                  ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-sm border border-zinc-200/60 dark:border-zinc-700/60'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Revision List — Apple Squircle Cards */}
      {revisions.length === 0 ? (
        <Card className="text-center py-12 space-y-3 rounded-3xl border border-white/20 dark:border-white/10 bg-white/80 dark:bg-zinc-900/70 backdrop-blur-2xl shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-zinc-400 flex items-center justify-center mx-auto shadow-xs">
            <RotateCw className="w-6 h-6" />
          </div>
          <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 text-sm">
            No active revision cycles yet
          </h3>
          <p className="text-xs text-zinc-500 max-w-sm mx-auto">
            When you complete syllabus topics in the Checklist, R1 reviews are automatically
            scheduled based on spaced repetition intervals.
          </p>
          <Button size="sm" variant="secondary" onClick={() => setShowAddModal(true)} className="rounded-full swiftui-press active:scale-[0.98]">
            Schedule Manual Review
          </Button>
        </Card>
      ) : filteredRevisions.length === 0 ? (
        <Card className="text-center py-8 rounded-3xl border border-white/20 dark:border-white/10 bg-white/80 dark:bg-zinc-900/70 backdrop-blur-2xl shadow-sm">
          <p className="text-xs text-zinc-500">No revisions match the selected filters.</p>
        </Card>
      ) : (
        <div className="space-y-3.5">
          {filteredRevisions.map((rev) => {
            const currentConf = selectedConfidence[rev.id] || rev.confidence || 'medium';
            const isDueToday = rev.nextTargetDate === today;
            const isOverdue = rev.nextTargetDate < today;

            return (
              <Card
                key={rev.id}
                className="flex flex-col lg:flex-row lg:items-center justify-between p-5 gap-4 rounded-2xl border border-white/20 dark:border-white/10 bg-white/80 dark:bg-zinc-900/70 backdrop-blur-xl shadow-sm transition-all hover:shadow-md"
              >
                <div className="space-y-2 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant={rev.subjectId} size="sm">
                      {rev.subjectId.toUpperCase()}
                    </Badge>
                    <Badge variant="outline" size="sm">
                      Cycle R{rev.cycle}
                    </Badge>
                    {isOverdue && (
                      <Badge variant="danger" size="sm">
                        Overdue
                      </Badge>
                    )}
                    {isDueToday && (
                      <Badge variant="completed" size="sm">
                        Due Today
                      </Badge>
                    )}
                    <h4 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">
                      {rev.topicTitle}
                    </h4>
                  </div>

                  <div className="flex flex-wrap items-center gap-2.5 text-xs text-zinc-500 dark:text-zinc-400">
                    <span>Last revised: {formatDate(rev.lastRevisedDate)}</span>
                    <span>•</span>
                    <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                      Next Target: {formatDate(rev.nextTargetDate)}
                    </span>
                    {rev.chapterName && <span>• {rev.chapterName}</span>}
                  </div>

                  {rev.mistakesNotes && (
                    <div className="p-3 rounded-xl bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/30 text-xs text-amber-900 dark:text-amber-200 mt-1.5 flex items-start gap-2.5">
                      <AlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                      <span className="break-words leading-relaxed">{rev.mistakesNotes}</span>
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap items-center justify-between sm:justify-end gap-2.5 border-t lg:border-t-0 pt-3.5 lg:pt-0 shrink-0 w-full lg:w-auto">
                  {/* Mistake Notebook Button */}
                  <button
                    type="button"
                    onClick={() => handleOpenNotes(rev)}
                    className="px-3 py-1.5 rounded-full text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200/60 dark:border-zinc-700/60 transition-colors text-xs flex items-center gap-1.5 swiftui-press active:scale-[0.96]"
                    title="Mistake Notebook Notes"
                  >
                    <FileEdit className="w-3.5 h-3.5 text-amber-500" />
                    <span>Notes</span>
                  </button>

                  {/* Confidence Selector — Apple Capsule Pill */}
                  <div className="flex items-center gap-1 bg-zinc-200/50 dark:bg-zinc-800/60 backdrop-blur-md p-1 rounded-full border border-zinc-300/40 dark:border-zinc-700/40">
                    {(['low', 'medium', 'high'] as const).map((conf) => (
                      <button
                        key={conf}
                        type="button"
                        onClick={() =>
                          setSelectedConfidence((prev) => ({ ...prev, [rev.id]: conf }))
                        }
                        className={cn(
                          'px-2.5 py-1 text-xs rounded-full font-medium transition-all swiftui-press active:scale-[0.96]',
                          currentConf === conf
                            ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-sm border border-zinc-200/60 dark:border-zinc-700/60 font-semibold'
                            : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                        )}
                      >
                        {conf === 'low'
                          ? 'Low (0.5x)'
                          : conf === 'medium'
                          ? 'Med (1x)'
                          : 'High (2x)'}
                      </button>
                    ))}
                  </div>

                  {/* Advance Button */}
                  <Button
                    size="sm"
                    variant="primary"
                    leftIcon={<CheckCircle2 className="w-4 h-4" />}
                    onClick={() => handleAdvance(rev.topicId, rev.id)}
                    className="rounded-full bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-sm swiftui-press active:scale-[0.98] font-semibold"
                  >
                    Advance to R{rev.cycle + 1}
                  </Button>

                  <Button
                    size="sm"
                    variant="ghost"
                    className="w-8 h-8 rounded-full flex items-center justify-center text-zinc-400 hover:text-rose-500 hover:bg-rose-500/10 swiftui-press"
                    onClick={() => deleteRevision(rev.id)}
                    title="Dismiss revision"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Mistake Notebook Modal — Apple Centered Glass Sheet */}
      {editingNotesRev && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <Card className="w-full max-w-lg p-6 sm:p-7 space-y-5 rounded-3xl border border-white/30 dark:border-white/15 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-2xl shadow-2xl">
            <div className="flex items-center justify-between pb-3.5 border-b border-zinc-100 dark:border-zinc-800/80">
              <div className="flex items-center gap-2">
                <FileEdit className="w-5 h-5 text-amber-500" />
                <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                  Mistake Notebook & Exam Traps
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingNotesRev(null)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 swiftui-press"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-zinc-500 truncate">{editingNotesRev.topicTitle}</p>
            <form onSubmit={handleSaveNotes} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                  Key Case Laws, Calculation Pitfalls, Formula Traps
                </label>
                <textarea
                  placeholder="e.g. Remember exception in Salomon v Salomon regarding fraud; in Partnership, goodwill ratio adjustment requires sacrificing ratio calculation..."
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  rows={5}
                  className="w-full p-3.5 text-xs rounded-xl bg-white/70 dark:bg-zinc-800/70 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100"
                  autoFocus
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setEditingNotesRev(null)}
                  className="rounded-full swiftui-press active:scale-[0.98]"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  className="rounded-full bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-sm swiftui-press active:scale-[0.98]"
                >
                  Save Notes
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Add Manual Revision Modal — Apple Centered Glass Sheet */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <Card className="w-full max-w-md p-6 sm:p-7 space-y-5 rounded-3xl border border-white/30 dark:border-white/15 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-2xl shadow-2xl">
            <div className="flex items-center justify-between pb-3.5 border-b border-zinc-100 dark:border-zinc-800/80">
              <div className="flex items-center gap-2">
                <RotateCw className="w-5 h-5 text-emerald-500" />
                <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                  Add Topic to Revision Queue
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 swiftui-press"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleAddManualRevision} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                  Select Topic
                </label>
                <select
                  value={manualTopicId}
                  onChange={(e) => setManualTopicId(e.target.value)}
                  className="w-full p-2.5 text-xs rounded-xl bg-white/70 dark:bg-zinc-800/70 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100"
                  required
                >
                  <option value="">-- Choose Syllabus Topic --</option>
                  {topics.map((top) => (
                    <option key={top.id} value={top.id}>
                      [{top.subjectId.toUpperCase()}] {top.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                  Initial Confidence Rating
                </label>
                <div className="flex items-center gap-2">
                  {(['low', 'medium', 'high'] as const).map((conf) => (
                    <button
                      key={conf}
                      type="button"
                      onClick={() => setManualConfidence(conf)}
                      className={cn(
                        'flex-1 p-2 rounded-xl text-xs font-medium transition-all swiftui-press active:scale-[0.98]',
                        manualConfidence === conf
                          ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 font-semibold shadow-sm'
                          : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                      )}
                    >
                      {conf === 'low' ? 'Low (+3d)' : conf === 'medium' ? 'Med (+7d)' : 'High (+14d)'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAddModal(false)}
                  className="rounded-full swiftui-press active:scale-[0.98]"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={!manualTopicId}
                  className="rounded-full bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-sm swiftui-press active:scale-[0.98]"
                >
                  Schedule Review
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
};
