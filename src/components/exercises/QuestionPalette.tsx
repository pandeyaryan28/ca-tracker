import React from 'react';
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
  className?: string;
}

export const QuestionPalette: React.FC<QuestionPaletteProps> = ({
  questions,
  currentIndex,
  selectedAnswers,
  markedForReview,
  onSelectQuestion,
  isReviewMode = false,
  className,
}) => {
  return (
    <div className={cn('flex flex-col gap-3', className)}>
      {/* Legend */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs text-zinc-600 dark:text-zinc-400 pb-2 border-b border-zinc-200 dark:border-zinc-800">
        {!isReviewMode ? (
          <>
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded-sm bg-emerald-600 dark:bg-emerald-500 shrink-0" />
              <span>Answered</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded-sm bg-amber-500 dark:bg-amber-500 shrink-0 flex items-center justify-center">
                <Bookmark className="w-2.5 h-2.5 text-white" />
              </span>
              <span>Marked</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded-sm border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 shrink-0" />
              <span>Unanswered</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded-sm ring-2 ring-zinc-900 dark:ring-zinc-100 bg-zinc-100 dark:bg-zinc-800 shrink-0" />
              <span>Current</span>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded-sm bg-emerald-600 text-white shrink-0 flex items-center justify-center text-[9px] font-bold">
                ✓
              </span>
              <span>Correct</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded-sm bg-rose-600 text-white shrink-0 flex items-center justify-center text-[9px] font-bold">
                ✗
              </span>
              <span>Incorrect</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded-sm bg-amber-500 text-white shrink-0 flex items-center justify-center">
                <Bookmark className="w-2.5 h-2.5" />
              </span>
              <span>Marked</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded-sm border border-zinc-300 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 shrink-0" />
              <span>Skipped</span>
            </div>
          </>
        )}
      </div>

      {/* Grid of question buttons */}
      <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2 max-h-72 overflow-y-auto pr-1">
        {questions.map((q, idx) => {
          const isCurrent = idx === currentIndex;
          const isAnswered = Boolean(selectedAnswers[q.id]);
          const isMarked = Boolean(markedForReview[q.id]);

          let statusClass = 'border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:border-zinc-400 dark:hover:border-zinc-500';

          if (isReviewMode) {
            const userAnswer = selectedAnswers[q.id];
            if (!userAnswer) {
              statusClass = 'border-zinc-300 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800/60 text-zinc-500 dark:text-zinc-400';
            } else if (userAnswer.toLowerCase() === q.correctOption.toLowerCase()) {
              statusClass = 'bg-emerald-600 text-white border-emerald-600 font-semibold';
            } else {
              statusClass = 'bg-rose-600 text-white border-rose-600 font-semibold';
            }
          } else {
            if (isAnswered && isMarked) {
              statusClass = 'bg-amber-600 text-white border-amber-600 font-semibold';
            } else if (isAnswered) {
              statusClass = 'bg-emerald-600 text-white border-emerald-600 font-semibold';
            } else if (isMarked) {
              statusClass = 'bg-amber-500 text-white border-amber-500 font-semibold';
            }
          }

          return (
            <button
              key={q.id}
              type="button"
              onClick={() => onSelectQuestion(idx)}
              className={cn(
                'relative flex items-center justify-center h-9 rounded-md border text-xs font-medium transition-all duration-150 active:scale-95 cursor-pointer',
                statusClass,
                isCurrent && 'ring-2 ring-zinc-900 dark:ring-zinc-100 ring-offset-1 dark:ring-offset-zinc-900 font-bold z-10'
              )}
              title={`Question ${idx + 1}${isMarked ? ' (Marked for Review)' : ''}${isAnswered ? ' (Answered)' : ''}`}
              aria-label={`Jump to question ${idx + 1}`}
            >
              <span>{idx + 1}</span>

              {/* Visibly marked flag indicator (shown in both test and review modes) */}
              {isMarked && (
                <span
                  className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-sm bg-amber-500 text-white flex items-center justify-center shadow-xs"
                  title="Marked for Review"
                >
                  <Bookmark className="w-2.5 h-2.5" />
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
