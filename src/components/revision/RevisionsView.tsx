import React, { useState, useMemo } from 'react';
import {
  RotateCw,
  CheckCircle2,
  AlertCircle,
  FileEdit,
  Plus,
  Trash2,
} from 'lucide-react';
import { useData } from '@/context/DataContext';
import { Card } from '@/components/common/Card';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import { ConfidenceLevel, RevisionRecord } from '@/types';
import { formatDate, getTodayDateString, calculateNextRevisionDate } from '@/lib/utils';

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
    <div className="space-y-6 animate-fade-in">
      {/* Header & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
            Spaced Repetition & Mistake Notebook
          </h2>
          <p className="text-xs text-zinc-500">
            Intelligent spaced review schedule ($R_1 \to R_2 \to R_3+$ with confidence intervals)
          </p>
        </div>

        <Button
          size="sm"
          variant="primary"
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={() => setShowAddModal(true)}
        >
          Add Revision Queue
        </Button>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="space-y-1">
          <span className="text-xs text-zinc-500 font-medium">Active Revisions</span>
          <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 tabular-nums">
            {revisions.length}
          </div>
        </Card>

        <Card className="space-y-1">
          <span className="text-xs text-zinc-500 font-medium">Due Today</span>
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
            {dueTodayCount}
          </div>
        </Card>

        <Card className="space-y-1">
          <span className="text-xs text-zinc-500 font-medium">Overdue Reviews</span>
          <div className="text-2xl font-bold text-red-500 tabular-nums">
            {overdueCount}
          </div>
        </Card>

        <Card className="space-y-1">
          <span className="text-xs text-zinc-500 font-medium">Mistake Notes</span>
          <div className="text-2xl font-bold text-amber-500 tabular-nums">
            {notesCount}
          </div>
        </Card>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-200/80 dark:border-zinc-800/80 pb-3">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
          <span className="text-xs text-zinc-500 font-medium shrink-0">Cycle:</span>
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
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors shrink-0 ${
                cycleFilter === item.id
                  ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 font-semibold'
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
          <span className="text-xs text-zinc-500 font-medium shrink-0">Due:</span>
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
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors shrink-0 ${
                dueFilter === item.id
                  ? 'bg-zinc-200 dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 font-semibold'
                  : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Revision List */}
      {revisions.length === 0 ? (
        <Card className="text-center py-12 space-y-3">
          <div className="w-12 h-12 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-400 flex items-center justify-center mx-auto">
            <RotateCw className="w-6 h-6" />
          </div>
          <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 text-sm">
            No active revision cycles yet
          </h3>
          <p className="text-xs text-zinc-500 max-w-sm mx-auto">
            When you complete syllabus topics in the Checklist, R1 reviews are automatically
            scheduled based on spaced repetition intervals.
          </p>
          <Button size="sm" variant="secondary" onClick={() => setShowAddModal(true)}>
            Schedule Manual Review
          </Button>
        </Card>
      ) : filteredRevisions.length === 0 ? (
        <Card className="text-center py-8">
          <p className="text-xs text-zinc-500">No revisions match the selected filters.</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredRevisions.map((rev) => {
            const currentConf = selectedConfidence[rev.id] || rev.confidence || 'medium';
            const isDueToday = rev.nextTargetDate === today;
            const isOverdue = rev.nextTargetDate < today;

            return (
              <Card
                key={rev.id}
                className="flex flex-col lg:flex-row lg:items-center justify-between p-4 gap-4 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors"
              >
                <div className="space-y-1.5 min-w-0">
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

                  <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-500">
                    <span>Last revised: {formatDate(rev.lastRevisedDate)}</span>
                    <span>•</span>
                    <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                      Next Target: {formatDate(rev.nextTargetDate)}
                    </span>
                    {rev.chapterName && <span>• {rev.chapterName}</span>}
                  </div>

                  {rev.mistakesNotes && (
                    <div className="p-2 rounded-lg bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-800/40 text-xs text-amber-900 dark:text-amber-200 mt-1 flex items-start gap-2">
                      <AlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                      <span className="break-words">{rev.mistakesNotes}</span>
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap items-center justify-between sm:justify-end gap-2 sm:gap-3 border-t lg:border-t-0 pt-3 lg:pt-0 shrink-0 w-full lg:w-auto">
                  {/* Mistake Notebook Button */}
                  <button
                    type="button"
                    onClick={() => handleOpenNotes(rev)}
                    className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors text-xs flex items-center gap-1 touch-target min-h-[38px]"
                    title="Mistake Notebook Notes"
                  >
                    <FileEdit className="w-4 h-4 text-amber-500" />
                    <span>Notes</span>
                  </button>

                  {/* Confidence Selector */}
                  <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800/80 p-1 rounded-xl">
                    {(['low', 'medium', 'high'] as const).map((conf) => (
                      <button
                        key={conf}
                        type="button"
                        onClick={() =>
                          setSelectedConfidence((prev) => ({ ...prev, [rev.id]: conf }))
                        }
                        className={`px-2 py-1 text-xs rounded-lg font-medium transition-all touch-target min-h-[32px] ${
                          currentConf === conf
                            ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-sm'
                            : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
                        }`}
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
                    className="touch-target min-h-[38px] flex-1 sm:flex-initial"
                  >
                    Advance to R{rev.cycle + 1}
                  </Button>

                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-zinc-400 hover:text-red-500 text-xs p-1.5 touch-target min-h-[38px] min-w-[38px] flex items-center justify-center"
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

      {/* Mistake Notebook Modal */}
      {editingNotesRev && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <Card className="w-full max-w-lg p-6 space-y-4">
            <div className="flex items-center gap-2">
              <FileEdit className="w-5 h-5 text-amber-500" />
              <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                Mistake Notebook & Exam Traps
              </h3>
            </div>
            <p className="text-xs text-zinc-500 truncate">{editingNotesRev.topicTitle}</p>
            <form onSubmit={handleSaveNotes} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Key Case Laws, Calculation Pitfalls, Formula Traps
                </label>
                <textarea
                  placeholder="e.g. Remember exception in Salomon v Salomon regarding fraud; in Partnership, goodwill ratio adjustment requires sacrificing ratio calculation..."
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  rows={5}
                  className="w-full p-3 text-xs rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-500"
                  autoFocus
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setEditingNotesRev(null)}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm">
                  Save Notes
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Add Manual Revision Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <Card className="w-full max-w-md p-6 space-y-4">
            <div className="flex items-center gap-2">
              <RotateCw className="w-5 h-5 text-emerald-500" />
              <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                Add Topic to Revision Queue
              </h3>
            </div>
            <form onSubmit={handleAddManualRevision} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Select Topic
                </label>
                <select
                  value={manualTopicId}
                  onChange={(e) => setManualTopicId(e.target.value)}
                  className="w-full p-2.5 text-xs rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100"
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
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Initial Confidence Rating
                </label>
                <div className="flex items-center gap-2">
                  {(['low', 'medium', 'high'] as const).map((conf) => (
                    <button
                      key={conf}
                      type="button"
                      onClick={() => setManualConfidence(conf)}
                      className={`flex-1 p-2 rounded-xl text-xs font-medium transition-all ${
                        manualConfidence === conf
                          ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 font-semibold shadow-sm'
                          : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                      }`}
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
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={!manualTopicId}
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
