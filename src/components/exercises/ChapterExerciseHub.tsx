import React, { useState } from 'react';
import {
  BookOpen,
  Play,
  CheckCircle2,
  Layers,
} from 'lucide-react';
import {
  ChapterExercise,
  ChapterExerciseUnit,
  ExerciseMode,
  ExerciseAttempt,
} from '@/types';
import { economicsExercises, getBestAttempt } from '@/lib/exerciseStorage';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { cn } from '@/lib/utils';

interface ChapterExerciseHubProps {
  onStartSession: (
    chapter: ChapterExercise,
    mode: ExerciseMode,
    unit?: ChapterExerciseUnit | null
  ) => void;
  onReviewAttempt: (attempt: ExerciseAttempt, chapter: ChapterExercise) => void;
}

export const ChapterExerciseHub: React.FC<ChapterExerciseHubProps> = ({
  onStartSession,
  onReviewAttempt,
}) => {
  // Store selected unit per chapter (or 'all' for entire chapter)
  const [selectedUnits, setSelectedUnits] = useState<Record<number, number | 'all'>>({});

  const handleUnitChange = (chapterNumber: number, val: number | 'all') => {
    setSelectedUnits((prev) => ({
      ...prev,
      [chapterNumber]: val,
    }));
  };

  return (
    <div className="flex flex-col max-w-6xl mx-auto px-4 py-6 gap-6 select-none">
      {/* Page Header */}
      <div className="p-6 rounded-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs font-semibold px-2.5 py-1 rounded-sm bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700">
            Paper 4 • Business Economics
          </span>
          <span className="text-xs text-zinc-500 dark:text-zinc-400">
            Official ICAI Study Module Exercises
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
          Digital Exercise & Practice Hub
        </h1>
        <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 mt-2 max-w-3xl leading-relaxed">
          Practice all 617 official multiple-choice questions from the ICAI study modules across all 10 chapters.
          For multi-unit chapters (Chapters 6–9), practice individual units or entire chapters.
          Cross-verify your answers against the verified ICAI answer key, review questions marked for review, and study conceptual solutions.
        </p>

        {/* Aggregate Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-zinc-100 dark:border-zinc-800">
          <div className="p-3 rounded-md bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800">
            <div className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
              Total Questions
            </div>
            <div className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mt-0.5">
              {economicsExercises.totalQuestions}
            </div>
          </div>
          <div className="p-3 rounded-md bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800">
            <div className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
              Total Chapters
            </div>
            <div className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mt-0.5">
              {economicsExercises.totalChapters}
            </div>
          </div>
          <div className="p-3 rounded-md bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800">
            <div className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
              Multi-Unit Chapters
            </div>
            <div className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mt-0.5">
              4 (Ch 6, 7, 8, 9)
            </div>
          </div>
          <div className="p-3 rounded-md bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800">
            <div className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
              Negative Marking
            </div>
            <div className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mt-0.5">
              -0.25 (Exam Mode)
            </div>
          </div>
        </div>
      </div>

      {/* Chapters Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {economicsExercises.chapters.map((chapter) => {
          const selectedUnitSetting = selectedUnits[chapter.chapterNumber] ?? 'all';
          const activeUnitObj =
            selectedUnitSetting !== 'all'
              ? chapter.units.find((u) => u.unitNumber === selectedUnitSetting)
              : null;

          const questionCount = activeUnitObj
            ? activeUnitObj.totalQuestions
            : chapter.totalQuestions;

          const bestAttempt = getBestAttempt(
            chapter.chapterNumber,
            activeUnitObj?.unitNumber ?? null
          );

          return (
            <Card
              key={chapter.chapterId}
              className="p-5 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex flex-col justify-between shadow-xs hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors"
            >
              <div>
                {/* Chapter Number & Question Count Header */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold px-2 py-0.5 rounded-sm bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900">
                      Chapter {chapter.chapterNumber}
                    </span>
                    {chapter.hasUnits && (
                      <span className="text-[11px] font-medium px-2 py-0.5 rounded-sm bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-900/60">
                        {chapter.units.length} Units
                      </span>
                    )}
                  </div>

                  <span className="text-xs font-mono font-semibold text-zinc-600 dark:text-zinc-400">
                    {questionCount} Questions
                  </span>
                </div>

                {/* Chapter Title */}
                <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 mb-1.5 leading-snug">
                  {chapter.title}
                </h3>

                {/* Description */}
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-4 line-clamp-2">
                  {chapter.description}
                </p>

                {/* MULTI-UNIT SELECTION SECTION (For Chapters 6, 7, 8, 9) */}
                {chapter.hasUnits && (
                  <div className="mb-4 p-3 rounded-md bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800">
                    <div className="flex items-center justify-between mb-2">
                      <label
                        htmlFor={`unit-select-${chapter.chapterNumber}`}
                        className="text-[11px] font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider flex items-center gap-1.5"
                      >
                        <Layers className="w-3.5 h-3.5 text-zinc-500" />
                        <span>Practice Unit or Full Chapter:</span>
                      </label>
                    </div>

                    <select
                      id={`unit-select-${chapter.chapterNumber}`}
                      value={selectedUnitSetting}
                      onChange={(e) =>
                        handleUnitChange(
                          chapter.chapterNumber,
                          e.target.value === 'all' ? 'all' : Number(e.target.value)
                        )
                      }
                      className="w-full text-xs font-medium rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 p-2 focus:ring-1 focus:ring-zinc-900 dark:focus:ring-zinc-100 cursor-pointer"
                    >
                      <option value="all">
                        Full Chapter (All {chapter.totalQuestions} Questions)
                      </option>
                      {chapter.units.map((unit) => (
                        <option key={unit.unitNumber} value={unit.unitNumber}>
                          {unit.unitTitle} ({unit.totalQuestions} Qs)
                        </option>
                      ))}
                    </select>

                    {/* Unit Quick Chips */}
                    <div className="flex flex-wrap gap-1.5 mt-2.5">
                      <button
                        type="button"
                        onClick={() => handleUnitChange(chapter.chapterNumber, 'all')}
                        className={cn(
                          'text-[10px] font-medium px-2 py-1 rounded-sm border transition-colors cursor-pointer',
                          selectedUnitSetting === 'all'
                            ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 border-zinc-900 dark:border-zinc-100'
                            : 'bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800 hover:border-zinc-400'
                        )}
                      >
                        All ({chapter.totalQuestions})
                      </button>
                      {chapter.units.map((unit) => (
                        <button
                          key={unit.unitNumber}
                          type="button"
                          onClick={() => handleUnitChange(chapter.chapterNumber, unit.unitNumber)}
                          className={cn(
                            'text-[10px] font-medium px-2 py-1 rounded-sm border transition-colors cursor-pointer',
                            selectedUnitSetting === unit.unitNumber
                              ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 border-zinc-900 dark:border-zinc-100'
                            : 'bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800 hover:border-zinc-400'
                          )}
                        >
                          U{unit.unitNumber} ({unit.totalQuestions})
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Best Attempt Status Banner */}
                <div className="p-2.5 rounded-md bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800 text-xs mb-4">
                  {bestAttempt ? (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        <span className="text-zinc-700 dark:text-zinc-300 font-medium">
                          Best Score: <strong>{bestAttempt.scaledScore} / {bestAttempt.totalQuestions}</strong> ({bestAttempt.accuracyPercentage}%)
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => onReviewAttempt(bestAttempt, chapter)}
                        className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 hover:underline cursor-pointer"
                      >
                        Review
                      </button>
                    </div>
                  ) : (
                    <div className="text-zinc-500 dark:text-zinc-400 italic">
                      Not attempted yet
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() =>
                    onStartSession(chapter, 'exam', activeUnitObj)
                  }
                  className="flex-1 flex items-center justify-center gap-1.5 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>Exam Mode</span>
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    onStartSession(chapter, 'practice', activeUnitObj)
                  }
                  className="flex-1 flex items-center justify-center gap-1.5"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Practice Mode</span>
                </Button>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
