import React, { useState } from 'react';
import { Bookmark } from 'lucide-react';
import { ExerciseQuestion, ExerciseOptionKey } from '@/types';
import { cn } from '@/lib/utils';

interface QuestionPaletteProps {
  questions: ExerciseQuestion[];
  currentIndex: number;
  selectedAnswers: Record<string, ExerciseOptionKey>;
  markedForReview: Record<string, boolean>;
  onSelectQuestion: (index: number) => void;
  isReviewMode?: boolean;
  showFooterStats?: boolean;
  className?: string;
}

type PaletteSessionFilter = 'all' | 'answered' | 'marked' | 'unanswered';
type PaletteReviewFilter = 'all' | 'correct' | 'incorrect' | 'marked' | 'skipped';

export const QuestionPalette: React.FC<QuestionPaletteProps> = ({
  questions,
  currentIndex,
  selectedAnswers,
  markedForReview,
  onSelectQuestion,
  isReviewMode = false,
  showFooterStats = !isReviewMode,
  className,
}) => {
  const [sessionFilter, setSessionFilter] = useState<PaletteSessionFilter>('all');
  const [reviewFilter, setReviewFilter] = useState<PaletteReviewFilter>('all');

  // Counts for filters
  const answeredCount = questions.filter((q) => Boolean(selectedAnswers[q.id])).length;
  const markedCount = questions.filter((q) => Boolean(markedForReview[q.id])).length;
  const unansweredCount = questions.length - answeredCount;

  const correctCount = questions.filter(
    (q) => selectedAnswers[q.id]?.toLowerCase() === q.correctOption.toLowerCase()
  ).length;
  const incorrectCount = questions.filter((q) => {
    const ans = selectedAnswers[q.id];
    return ans && ans.toLowerCase() !== q.correctOption.toLowerCase();
  }).length;
  const skippedCount = questions.filter((q) => !selectedAnswers[q.id]).length;

  // Filter questions according to active tab inside palette
  const filteredIndexedQuestions = questions
    .map((q, idx) => ({ q, idx }))
    .filter(({ q }) => {
      if (!isReviewMode) {
        if (sessionFilter === 'answered') return Boolean(selectedAnswers[q.id]);
        if (sessionFilter === 'marked') return Boolean(markedForReview[q.id]);
        if (sessionFilter === 'unanswered') return !selectedAnswers[q.id];
        return true;
      } else {
        const userAnswer = selectedAnswers[q.id];
        const isCorrect = userAnswer?.toLowerCase() === q.correctOption.toLowerCase();
        const isMarked = Boolean(markedForReview[q.id]);

        if (reviewFilter === 'correct') return Boolean(userAnswer && isCorrect);
        if (reviewFilter === 'incorrect') return Boolean(userAnswer && !isCorrect);
        if (reviewFilter === 'marked') return isMarked;
        if (reviewFilter === 'skipped') return !userAnswer;
        return true;
      }
    });

  return (
    <div className={cn('flex flex-col gap-3', className)}>
      {/* Legend */}
      <div className="grid grid-cols-2 gap-2 text-xs text-zinc-600 dark:text-zinc-400 pb-2.5 border-b border-zinc-200 dark:border-zinc-800">
        {!isReviewMode ? (
          <>
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="w-3 h-3 rounded-sm bg-emerald-600 dark:bg-emerald-500 shrink-0" />
              <span className="truncate">Answered</span>
            </div>
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="w-3 h-3 rounded-sm bg-amber-500 dark:bg-amber-500 shrink-0 flex items-center justify-center">
                <Bookmark className="w-2 h-2 text-white fill-current" />
              </span>
              <span className="truncate">Marked</span>
            </div>
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="w-3 h-3 rounded-sm border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 shrink-0" />
              <span className="truncate">Unanswered</span>
            </div>
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="w-3 h-3 rounded-sm ring-2 ring-zinc-900 dark:ring-zinc-100 ring-offset-1 dark:ring-offset-zinc-900 bg-zinc-100 dark:bg-zinc-800 shrink-0 m-0.5" />
              <span className="truncate">Current</span>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="w-3 h-3 rounded-sm bg-emerald-600 text-white shrink-0 flex items-center justify-center text-[8px] font-bold">
                ✓
              </span>
              <span className="truncate">Correct</span>
            </div>
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="w-3 h-3 rounded-sm bg-rose-600 text-white shrink-0 flex items-center justify-center text-[8px] font-bold">
                ✗
              </span>
              <span className="truncate">Incorrect</span>
            </div>
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="w-3 h-3 rounded-sm bg-amber-500 text-white shrink-0 flex items-center justify-center">
                <Bookmark className="w-2 h-2 fill-current" />
              </span>
              <span className="truncate">Marked</span>
            </div>
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="w-3 h-3 rounded-sm border border-zinc-300 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 shrink-0" />
              <span className="truncate">Skipped</span>
            </div>
          </>
        )}
      </div>

      {/* Internal Palette Filter Tabs */}
      <div className="grid grid-cols-2 gap-1.5 text-xs">
        {!isReviewMode ? (
          <>
            <button
              type="button"
              onClick={() => setSessionFilter('all')}
              className={cn(
                'w-full py-1.5 px-2 rounded-full border font-semibold text-center transition-all cursor-pointer text-xs truncate swiftui-press active:scale-[0.96]',
                sessionFilter === 'all'
                  ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 border-zinc-900 dark:border-zinc-100 shadow-xs'
                  : 'bg-black/[0.03] dark:bg-white/[0.05] text-zinc-600 dark:text-zinc-400 border-black/[0.06] dark:border-white/[0.08] hover:text-zinc-900 dark:hover:text-zinc-100'
              )}
            >
              All ({questions.length})
            </button>
            <button
              type="button"
              onClick={() => setSessionFilter('answered')}
              className={cn(
                'w-full py-1.5 px-2 rounded-full border font-semibold text-center transition-all cursor-pointer text-xs truncate swiftui-press active:scale-[0.96]',
                sessionFilter === 'answered'
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                  : 'bg-black/[0.03] dark:bg-white/[0.05] text-zinc-600 dark:text-zinc-400 border-black/[0.06] dark:border-white/[0.08] hover:text-emerald-600 dark:hover:text-emerald-400'
              )}
            >
              Answered ({answeredCount})
            </button>
            <button
              type="button"
              title="Filter by Marked for Review"
              onClick={() => setSessionFilter('marked')}
              className={cn(
                'w-full py-1.5 px-2 rounded-full border font-semibold text-center transition-all cursor-pointer text-xs truncate swiftui-press active:scale-[0.96]',
                sessionFilter === 'marked'
                  ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                  : 'bg-black/[0.03] dark:bg-white/[0.05] text-zinc-600 dark:text-zinc-400 border-black/[0.06] dark:border-white/[0.08] hover:text-amber-600 dark:hover:text-amber-400'
              )}
            >
              Marked ({markedCount})
            </button>
            <button
              type="button"
              title="Filter by Unanswered / Pending"
              onClick={() => setSessionFilter('unanswered')}
              className={cn(
                'w-full py-1.5 px-2 rounded-full border font-semibold text-center transition-all cursor-pointer text-xs truncate swiftui-press active:scale-[0.96]',
                sessionFilter === 'unanswered'
                  ? 'bg-zinc-700 text-white border-zinc-700 dark:bg-zinc-300 dark:text-zinc-900 shadow-xs'
                  : 'bg-black/[0.03] dark:bg-white/[0.05] text-zinc-600 dark:text-zinc-400 border-black/[0.06] dark:border-white/[0.08] hover:text-zinc-900 dark:hover:text-zinc-100'
              )}
            >
              Pending ({unansweredCount})
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              onClick={() => setReviewFilter('all')}
              className={cn(
                'col-span-2 w-full py-1.5 px-2 rounded-full border font-semibold text-center transition-all cursor-pointer text-xs truncate swiftui-press active:scale-[0.96]',
                reviewFilter === 'all'
                  ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 border-zinc-900 dark:border-zinc-100 shadow-xs'
                  : 'bg-black/[0.03] dark:bg-white/[0.05] text-zinc-600 dark:text-zinc-400 border-black/[0.06] dark:border-white/[0.08] hover:text-zinc-900 dark:hover:text-zinc-100'
              )}
            >
              All ({questions.length})
            </button>
            <button
              type="button"
              onClick={() => setReviewFilter('correct')}
              className={cn(
                'w-full py-1.5 px-2 rounded-full border font-semibold text-center transition-all cursor-pointer text-xs truncate swiftui-press active:scale-[0.96]',
                reviewFilter === 'correct'
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                  : 'bg-black/[0.03] dark:bg-white/[0.05] text-zinc-600 dark:text-zinc-400 border-black/[0.06] dark:border-white/[0.08] hover:text-emerald-600 dark:hover:text-emerald-400'
              )}
            >
              Correct ({correctCount})
            </button>
            <button
              type="button"
              onClick={() => setReviewFilter('incorrect')}
              className={cn(
                'w-full py-1.5 px-2 rounded-full border font-semibold text-center transition-all cursor-pointer text-xs truncate swiftui-press active:scale-[0.96]',
                reviewFilter === 'incorrect'
                  ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                  : 'bg-black/[0.03] dark:bg-white/[0.05] text-zinc-600 dark:text-zinc-400 border-black/[0.06] dark:border-white/[0.08] hover:text-rose-600 dark:hover:text-rose-400'
              )}
            >
              Incorrect ({incorrectCount})
            </button>
            <button
              type="button"
              onClick={() => setReviewFilter('marked')}
              className={cn(
                'w-full py-1.5 px-2 rounded-full border font-semibold text-center transition-all cursor-pointer text-xs truncate swiftui-press active:scale-[0.96]',
                reviewFilter === 'marked'
                  ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                  : 'bg-black/[0.03] dark:bg-white/[0.05] text-zinc-600 dark:text-zinc-400 border-black/[0.06] dark:border-white/[0.08] hover:text-amber-600 dark:hover:text-amber-400'
              )}
            >
              Marked ({markedCount})
            </button>
            <button
              type="button"
              onClick={() => setReviewFilter('skipped')}
              className={cn(
                'w-full py-1.5 px-2 rounded-full border font-semibold text-center transition-all cursor-pointer text-xs truncate swiftui-press active:scale-[0.96]',
                reviewFilter === 'skipped'
                  ? 'bg-zinc-700 text-white border-zinc-700 dark:bg-zinc-300 dark:text-zinc-900 shadow-xs'
                  : 'bg-black/[0.03] dark:bg-white/[0.05] text-zinc-600 dark:text-zinc-400 border-black/[0.06] dark:border-white/[0.08] hover:text-zinc-900 dark:hover:text-zinc-100'
              )}
            >
              Skipped ({skippedCount})
            </button>
          </>
        )}
      </div>

      {/* Grid of question buttons */}
      {filteredIndexedQuestions.length === 0 ? (
        <div className="py-6 text-center text-xs text-zinc-500 dark:text-zinc-400 rounded-2xl border border-dashed border-black/[0.08] dark:border-white/10">
          No questions in this filter
        </div>
      ) : (
        <div className="grid grid-cols-5 gap-2 max-h-80 overflow-y-auto pr-1">
          {filteredIndexedQuestions.map(({ q, idx }) => {
            const isCurrent = idx === currentIndex;
            const isAnswered = Boolean(selectedAnswers[q.id]);
            const isMarked = Boolean(markedForReview[q.id]);

            let statusClass =
              'border-black/[0.08] dark:border-white/10 bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:border-zinc-400 dark:hover:border-zinc-500 hover:bg-black/[0.02] dark:hover:bg-white/[0.04]';

            if (isReviewMode) {
              const userAnswer = selectedAnswers[q.id];
              if (!userAnswer) {
                statusClass =
                  'border-black/[0.06] dark:border-white/[0.08] bg-black/[0.02] dark:bg-white/[0.03] text-zinc-500 dark:text-zinc-400 hover:border-zinc-400';
              } else if (userAnswer.toLowerCase() === q.correctOption.toLowerCase()) {
                statusClass = 'bg-emerald-600 text-white border-emerald-600 font-semibold hover:bg-emerald-500';
              } else {
                statusClass = 'bg-rose-600 text-white border-rose-600 font-semibold hover:bg-rose-500';
              }
            } else {
              if (isAnswered && isMarked) {
                statusClass = 'bg-amber-600 text-white border-amber-600 font-semibold hover:bg-amber-500';
              } else if (isAnswered) {
                statusClass = 'bg-emerald-600 text-white border-emerald-600 font-semibold hover:bg-emerald-500';
              } else if (isMarked) {
                statusClass = 'bg-amber-500 text-white border-amber-500 font-semibold hover:bg-amber-400';
              }
            }

            return (
              <button
                key={q.id}
                type="button"
                onClick={() => onSelectQuestion(idx)}
                className={cn(
                  'relative flex items-center justify-center h-9 w-full rounded-xl border text-xs font-semibold transition-all duration-150 hover:-translate-y-0.5 hover:shadow-xs swiftui-press active:scale-95 cursor-pointer',
                  statusClass,
                  isCurrent &&
                    'ring-2 ring-zinc-900 dark:ring-zinc-100 ring-offset-2 dark:ring-offset-zinc-900 font-bold z-10'
                )}
                title={`Question ${idx + 1}${isMarked ? ' (Marked for Review)' : ''}${isAnswered ? ' (Answered)' : ''}`}
                aria-label={`Jump to question ${idx + 1}`}
              >
                <span>{idx + 1}</span>

                {/* Visibly marked flag indicator */}
                {isMarked && (
                  <span
                    className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-amber-500 text-white flex items-center justify-center shadow-xs pointer-events-none"
                    title="Marked for Review"
                  >
                    <Bookmark className="w-2.5 h-2.5 fill-current" />
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* 3-Column Metric Strip */}
      {showFooterStats && !isReviewMode && (
        <div className="grid grid-cols-3 gap-2 pt-3 border-t border-black/[0.04] dark:border-white/[0.06] text-center">
          <div className="flex flex-col items-center justify-center py-2 px-1 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
            <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider">
              Answered
            </span>
            <span className="text-sm font-bold text-emerald-800 dark:text-emerald-200 font-mono mt-0.5">
              {answeredCount}
            </span>
          </div>
          <div className="flex flex-col items-center justify-center py-2 px-1 rounded-2xl bg-amber-500/10 border border-amber-500/20">
            <span className="text-[10px] font-semibold text-amber-700 dark:text-amber-300 uppercase tracking-wider">
              Marked
            </span>
            <span className="text-sm font-bold text-amber-800 dark:text-amber-200 font-mono mt-0.5">
              {markedCount}
            </span>
          </div>
          <div className="flex flex-col items-center justify-center py-2 px-1 rounded-2xl bg-black/[0.03] dark:bg-white/[0.05] border border-black/[0.06] dark:border-white/[0.08]">
            <span className="text-[10px] font-semibold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider">
              Pending
            </span>
            <span className="text-sm font-bold text-zinc-800 dark:text-zinc-200 font-mono mt-0.5">
              {unansweredCount}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
