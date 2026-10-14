import React, { useState } from 'react';
import {
  CheckCircle2,
  XCircle,
  Bookmark,
  BookOpen,
  ArrowLeft,
  RotateCcw,
  Check,
  FileSpreadsheet,
  Award,
  Clock,
  Target,
} from 'lucide-react';
import {
  ExerciseAttempt,
  ExerciseQuestion,
  ExerciseReviewFilter,
} from '@/types';
import { loadExerciseAttempts, saveExerciseAttempt } from '@/lib/exerciseStorage';
import { useData } from '@/context/DataContext';
import { QuestionPalette } from './QuestionPalette';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { cn } from '@/lib/utils';

interface CrossVerificationReviewProps {
  attempt: ExerciseAttempt;
  questions: ExerciseQuestion[];
  onRetake: (customQuestions?: ExerciseQuestion[]) => void;
  onBackToHub: () => void;
}

export const CrossVerificationReview: React.FC<CrossVerificationReviewProps> = ({
  attempt,
  questions,
  onRetake,
  onBackToHub,
}) => {
  const { addTest } = useData();
  const [activeFilter, setActiveFilter] = useState<ExerciseReviewFilter>('all');
  const [selectedQuestionIndex, setSelectedQuestionIndex] = useState(0);
  const [recordedToTestSeries, setRecordedToTestSeries] = useState(false);
  const [highlightedQuestionId, setHighlightedQuestionId] = useState<string | null>(null);

  // Local state for marked for review to allow toggling during post-submission review
  const [reviewMarkedForReview, setReviewMarkedForReview] = useState<Record<string, boolean>>(
    attempt.markedForReview || {}
  );

  const {
    chapterNumber,
    chapterTitle,
    unitTitle,
    score,
    scaledScore,
    totalQuestions,
    correctCount,
    incorrectCount,
    unattemptedCount,
    accuracyPercentage,
    timeSpentSeconds,
    selectedAnswers,
  } = attempt;

  // Toggle marked for review during post-submission review
  const handleToggleMark = (questionId: string) => {
    setReviewMarkedForReview((prev) => {
      const updated = { ...prev, [questionId]: !prev[questionId] };
      // Sync to stored attempts in localStorage
      try {
        const attempts = loadExerciseAttempts();
        const targetIdx = attempts.findIndex((a) => a.id === attempt.id);
        if (targetIdx !== -1) {
          attempts[targetIdx].markedForReview = updated;
          saveExerciseAttempt(attempts[targetIdx]);
        }
      } catch (err) {
        console.error('Failed to sync marked for review state:', err);
      }
      return updated;
    });
  };

  // Compute counts using active reviewMarkedForReview state
  const markedQuestionsCount = questions.filter((q) => reviewMarkedForReview[q.id]).length;

  // Filtered questions
  const filteredQuestions = questions.filter((q) => {
    const userAnswer = selectedAnswers[q.id];
    const isCorrect = userAnswer?.toLowerCase() === q.correctOption.toLowerCase();
    const isMarked = Boolean(reviewMarkedForReview[q.id]);

    switch (activeFilter) {
      case 'incorrect':
        return Boolean(userAnswer && !isCorrect);
      case 'correct':
        return Boolean(userAnswer && isCorrect);
      case 'marked':
        return isMarked;
      case 'skipped':
        return !userAnswer;
      case 'all':
      default:
        return true;
    }
  });

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins}m ${secs}s`;
  };

  const handleRecordToTestSeries = () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const testTitle = unitTitle
        ? `Paper 4 Ch ${chapterNumber}: ${unitTitle}`
        : `Paper 4 Ch ${chapterNumber}: ${chapterTitle}`;

      addTest({
        title: testTitle,
        subjectId: 'paper4',
        testType: unitTitle ? 'unit' : 'chapter',
        chapterId: attempt.chapterId,
        dateAttempted: today,
        totalMarks: totalQuestions,
        marksObtained: scaledScore,
        negativeMarksDeducted: Number((incorrectCount * 0.25).toFixed(2)),
        timeTakenMinutes: Math.max(1, Math.round(timeSpentSeconds / 60)),
        notes: `Digital Exercise (${attempt.mode} mode). Raw score: ${score}/${totalQuestions}, Incorrect: ${incorrectCount}, Time: ${formatTime(timeSpentSeconds)}`,
      });
      setRecordedToTestSeries(true);
    } catch (err) {
      console.error('Failed to record test to Test Series:', err);
    }
  };

  const handlePracticeMarkedOnly = () => {
    const markedSubset = questions.filter((q) => reviewMarkedForReview[q.id]);
    if (markedSubset.length > 0) {
      onRetake(markedSubset);
    }
  };

  const handlePracticeIncorrectOnly = () => {
    const incorrectSubset = questions.filter((q) => {
      const ans = selectedAnswers[q.id];
      return ans && ans.toLowerCase() !== q.correctOption.toLowerCase();
    });
    if (incorrectSubset.length > 0) {
      onRetake(incorrectSubset);
    }
  };

  const passStatus =
    scaledScore >= totalQuestions * 0.7
      ? {
          label: 'Distinction (≥70%)',
          color:
            'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800',
        }
      : scaledScore >= totalQuestions * 0.4
      ? {
          label: 'Pass Benchmark (≥40%)',
          color:
            'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800',
        }
      : {
          label: 'Needs Practice (<40%)',
          color:
            'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800',
        };

  return (
    <div className="flex flex-col max-w-6xl mx-auto px-4 py-6 gap-6 select-none">
      {/* Top Header / Back Button */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onBackToHub}
          className="flex items-center gap-2 text-sm font-semibold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Exercises Hub</span>
        </button>

        <span className="text-xs text-zinc-500 dark:text-zinc-400 font-mono">
          Completed {new Date(attempt.completedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>

      {/* Primary Score & Performance Metric Card */}
      <Card className="p-6 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-zinc-100 dark:border-zinc-800">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700">
                Chapter {chapterNumber}
              </span>
              {unitTitle && (
                <span className="text-xs font-medium px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                  {unitTitle}
                </span>
              )}
              <span className={cn('text-xs font-semibold px-2 py-0.5 rounded-md border', passStatus.color)}>
                {passStatus.label}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-100">
              Cross-Verification & Results: {chapterTitle}
            </h1>
          </div>

          {/* Action to log into test series */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            <Button
              variant={recordedToTestSeries ? 'outline' : 'primary'}
              size="sm"
              onClick={handleRecordToTestSeries}
              disabled={recordedToTestSeries}
              className={cn(
                'flex items-center gap-1.5 w-full md:w-auto justify-center font-semibold',
                !recordedToTestSeries && 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900'
              )}
            >
              {recordedToTestSeries ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>Logged in Test Series</span>
                </>
              ) : (
                <>
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>Log in Test Series</span>
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Metric Badges Grid: Prominent KPI Score Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-6">
          <div className="p-3.5 rounded-md border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/40">
            <div className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider flex items-center gap-1">
              <Award className="w-3.5 h-3.5 text-zinc-400" />
              <span>Scaled Score</span>
            </div>
            <div className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-100 mt-1">
              {scaledScore} <span className="text-xs text-zinc-500 dark:text-zinc-400 font-normal">/ {totalQuestions}</span>
            </div>
            <div className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-0.5">
              -0.25 negative marking
            </div>
          </div>

          <div className="p-3.5 rounded-md border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/40">
            <div className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider flex items-center gap-1">
              <Target className="w-3.5 h-3.5 text-zinc-400" />
              <span>Raw Accuracy</span>
            </div>
            <div className="text-xl sm:text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
              {accuracyPercentage}%
            </div>
            <div className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-0.5">
              {correctCount} correct of {correctCount + incorrectCount}
            </div>
          </div>

          <div className="p-3.5 rounded-md border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/50 dark:bg-emerald-950/20">
            <div className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Correct</span>
            </div>
            <div className="text-xl sm:text-2xl font-bold text-emerald-700 dark:text-emerald-300 mt-1">
              {correctCount}
            </div>
            <div className="text-[10px] text-emerald-600/80 dark:text-emerald-400/80 mt-0.5">
              +1.00 mark each
            </div>
          </div>

          <div className="p-3.5 rounded-md border border-rose-200 dark:border-rose-900/60 bg-rose-50/50 dark:bg-rose-950/20">
            <div className="text-[11px] font-semibold text-rose-700 dark:text-rose-300 uppercase tracking-wider flex items-center gap-1">
              <XCircle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
              <span>Incorrect</span>
            </div>
            <div className="text-xl sm:text-2xl font-bold text-rose-700 dark:text-rose-300 mt-1">
              {incorrectCount}
            </div>
            <div className="text-[10px] text-rose-600/80 dark:text-rose-400/80 mt-0.5">
              -0.25 penalty each
            </div>
          </div>

          {/* Marked for Review Card */}
          <div className="p-3.5 rounded-md border border-amber-200 dark:border-amber-900/60 bg-amber-50/50 dark:bg-amber-950/20">
            <div className="text-[11px] font-semibold text-amber-700 dark:text-amber-300 uppercase tracking-wider flex items-center gap-1">
              <Bookmark className="w-3.5 h-3.5 fill-current" />
              <span>Marked for Review</span>
            </div>
            <div className="text-xl sm:text-2xl font-bold text-amber-700 dark:text-amber-300 mt-1">
              {markedQuestionsCount}
            </div>
            <div className="text-[10px] text-amber-600/80 dark:text-amber-400/80 mt-0.5">
              Flagged questions
            </div>
          </div>

          <div className="p-3.5 rounded-md border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/40">
            <div className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-zinc-400" />
              <span>Time Taken</span>
            </div>
            <div className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-100 mt-1">
              {formatTime(timeSpentSeconds)}
            </div>
            <div className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-0.5">
              {unattemptedCount} skipped
            </div>
          </div>
        </div>

        {/* Quick Review Target Actions */}
        <div className="flex flex-wrap items-center gap-3 mt-6 pt-5 border-t border-zinc-100 dark:border-zinc-800">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onRetake()}
            className="flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{unitTitle ? 'Retake Unit Exercise' : 'Retake Full Chapter'}</span>
          </Button>

          {markedQuestionsCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handlePracticeMarkedOnly}
              className="flex items-center gap-1.5 border-amber-300 text-amber-800 dark:border-amber-700 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-950/40 font-medium"
            >
              <Bookmark className="w-3.5 h-3.5 fill-current" />
              <span>Practice Marked Only ({markedQuestionsCount})</span>
            </Button>
          )}

          {incorrectCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handlePracticeIncorrectOnly}
              className="flex items-center gap-1.5 border-rose-300 text-rose-800 dark:border-rose-700 dark:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-950/40 font-medium"
            >
              <XCircle className="w-3.5 h-3.5" />
              <span>Practice Incorrect Only ({incorrectCount})</span>
            </Button>
          )}
        </div>
      </Card>

      {/* Review Matrix & Filter Tabs */}
      <div className="flex flex-col gap-4">
        {/* Filter Navigation Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-zinc-200 dark:border-zinc-800">
          <button
            type="button"
            aria-label="Filter: All Questions"
            onClick={() => setActiveFilter('all')}
            className={cn(
              'px-3 py-1.5 text-xs font-semibold rounded-md border transition-colors cursor-pointer shrink-0',
              activeFilter === 'all'
                ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 border-zinc-900 dark:border-zinc-100'
                : 'bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800'
            )}
          >
            All Questions ({totalQuestions})
          </button>

          <button
            type="button"
            aria-label="Filter: Incorrect"
            onClick={() => setActiveFilter('incorrect')}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md border transition-colors cursor-pointer shrink-0',
              activeFilter === 'incorrect'
                ? 'bg-rose-600 text-white border-rose-600'
                : 'bg-white dark:bg-zinc-900 text-rose-700 dark:text-rose-400 border-zinc-200 dark:border-zinc-800 hover:bg-rose-50 dark:hover:bg-rose-950/30'
            )}
          >
            <span>Incorrect</span>
            <span className="px-1.5 py-0.5 rounded-md bg-rose-100 dark:bg-rose-900/60 text-[10px]">
              {incorrectCount}
            </span>
          </button>

          {/* Dedicated Marked for Review Filter Tab */}
          <button
            type="button"
            aria-label="Filter: Marked for Review"
            onClick={() => setActiveFilter('marked')}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md border transition-colors cursor-pointer shrink-0',
              activeFilter === 'marked'
                ? 'bg-amber-600 text-white border-amber-600'
                : 'bg-white dark:bg-zinc-900 text-amber-700 dark:text-amber-400 border-zinc-200 dark:border-zinc-800 hover:bg-amber-50 dark:hover:bg-amber-950/30'
            )}
          >
            <Bookmark className="w-3 h-3 fill-current" />
            <span>Marked for Review</span>
            <span className="px-1.5 py-0.5 rounded-md bg-amber-100 dark:bg-amber-900/60 text-[10px]">
              {markedQuestionsCount}
            </span>
          </button>

          <button
            type="button"
            aria-label="Filter: Correct"
            onClick={() => setActiveFilter('correct')}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md border transition-colors cursor-pointer shrink-0',
              activeFilter === 'correct'
                ? 'bg-emerald-600 text-white border-emerald-600'
                : 'bg-white dark:bg-zinc-900 text-emerald-700 dark:text-emerald-400 border-zinc-200 dark:border-zinc-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/30'
            )}
          >
            <span>Correct</span>
            <span className="px-1.5 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-900/60 text-[10px]">
              {correctCount}
            </span>
          </button>

          <button
            type="button"
            aria-label="Filter: Skipped"
            onClick={() => setActiveFilter('skipped')}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md border transition-colors cursor-pointer shrink-0',
              activeFilter === 'skipped'
                ? 'bg-zinc-600 text-white border-zinc-600'
                : 'bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800'
            )}
          >
            <span>Skipped</span>
            <span className="px-1.5 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-[10px]">
              {unattemptedCount}
            </span>
          </button>
        </div>

        {/* 12-column Grid: Review Cards (8 cols) & Sticky Verification Matrix Palette (4 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start mt-2">
          {/* Left Column: Question-by-Question Review Cards (8 cols) */}
          <div className="lg:col-span-8 flex flex-col gap-5 order-2 lg:order-1">
          {filteredQuestions.length === 0 ? (
            <div className="p-12 text-center rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                No questions found matching the <strong>"{activeFilter}"</strong> filter.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setActiveFilter('all')}
                className="mt-3"
              >
                Show All Questions
              </Button>
            </div>
          ) : (
            filteredQuestions.map((q) => {
              const originalIndex = questions.findIndex((orig) => orig.id === q.id);
              const userAnswer = selectedAnswers[q.id];
              const isCorrect = userAnswer?.toLowerCase() === q.correctOption.toLowerCase();
              const isMarked = Boolean(reviewMarkedForReview[q.id]);

              return (
                <Card
                  key={q.id}
                  id={`review-question-${originalIndex}`}
                  className={cn(
                    'p-6 border bg-white dark:bg-zinc-900 transition-all shadow-sm',
                    isMarked && 'border-l-4 border-l-amber-500 bg-amber-50/20 dark:bg-amber-950/15',
                    highlightedQuestionId === q.id &&
                      'ring-2 ring-zinc-900 dark:ring-zinc-100 ring-offset-2 dark:ring-offset-zinc-900',
                    isCorrect
                      ? 'border-emerald-200 dark:border-emerald-950/80'
                      : userAnswer
                      ? 'border-rose-200 dark:border-rose-950/80'
                      : 'border-zinc-200 dark:border-zinc-800'
                  )}
                >
                  {/* Question Header Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-4 mb-4 border-b border-zinc-100 dark:border-zinc-800">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900">
                        Question {originalIndex + 1}
                      </span>
                      {q.unitTitle && (
                        <span className="text-xs text-zinc-500 dark:text-zinc-400 hidden sm:inline">
                          • {q.unitTitle}
                        </span>
                      )}

                      {/* Correctness Status Tag */}
                      {userAnswer ? (
                        isCorrect ? (
                          <span className="flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Correct (+1.00)</span>
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-md bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-300 dark:border-rose-800">
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Incorrect (-0.25)</span>
                          </span>
                        )
                      ) : (
                        <span className="text-xs font-medium px-2 py-0.5 rounded-md bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700">
                          Unattempted (0.00)
                        </span>
                      )}
                    </div>

                    {/* Prominent Marked for Review Interactive Toggle Button */}
                    <button
                      type="button"
                      aria-label={isMarked ? 'Unmark question from review' : 'Mark question for review'}
                      onClick={() => handleToggleMark(q.id)}
                      className={cn(
                        'flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-md border transition-colors cursor-pointer',
                        isMarked
                          ? 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950/70 dark:text-amber-200 dark:border-amber-700/70 hover:bg-amber-200 dark:hover:bg-amber-900/60'
                          : 'bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700'
                      )}
                      title={isMarked ? 'Click to unmark this question' : 'Click to mark this question for review'}
                    >
                      <Bookmark className={cn('w-3.5 h-3.5', isMarked && 'fill-current')} />
                      <span>{isMarked ? 'Marked for Review' : 'Mark for Review'}</span>
                    </button>
                  </div>

                  {/* Context Data Table if present */}
                  {q.context && q.context.trim() && !/test your knowledge/i.test(q.context) && !/multiple choice/i.test(q.context) && (
                    <div className="mb-4 p-4 rounded-md border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/60 font-mono text-xs text-zinc-800 dark:text-zinc-200 whitespace-pre-wrap leading-relaxed overflow-x-auto">
                      {q.context}
                    </div>
                  )}

                  {/* Question Prompt */}
                  <div className="text-base font-medium text-zinc-900 dark:text-zinc-100 mb-5 leading-relaxed">
                    {q.questionText}
                  </div>

                  {/* Options List with High-Contrast Color Coding */}
                  <div className="flex flex-col gap-2.5 mb-5">
                    {q.options.map((option) => {
                      const isOptionCorrect = option.key.toLowerCase() === q.correctOption.toLowerCase();
                      const isOptionSelected = userAnswer?.toLowerCase() === option.key.toLowerCase();

                      let optionStyle =
                        'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300';
                      let keyStyle = 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400';

                      if (isOptionCorrect) {
                        optionStyle =
                          'border-emerald-500 bg-emerald-50/80 dark:bg-emerald-950/40 text-emerald-950 dark:text-emerald-100 ring-1 ring-emerald-500';
                        keyStyle = 'bg-emerald-600 text-white font-bold';
                      } else if (isOptionSelected && !isOptionCorrect) {
                        optionStyle =
                          'border-rose-500 bg-rose-50/80 dark:bg-rose-950/40 text-rose-950 dark:text-rose-100 ring-1 ring-rose-500';
                        keyStyle = 'bg-rose-600 text-white font-bold';
                      }

                      return (
                        <div
                          key={option.key}
                          className={cn(
                            'flex items-start gap-3 p-3.5 rounded-md border text-sm leading-snug',
                            optionStyle
                          )}
                        >
                          <span
                            className={cn(
                              'flex items-center justify-center w-6 h-6 rounded-md text-xs uppercase shrink-0',
                              keyStyle
                            )}
                          >
                            {option.key}
                          </span>
                          <span className="flex-1 mt-0.5">{option.text}</span>

                          {/* Indicators on option row */}
                          {isOptionCorrect && (
                            <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 flex items-center gap-1 shrink-0 mt-0.5">
                              <CheckCircle2 className="w-4 h-4" />
                              <span className="hidden sm:inline">Official Answer</span>
                            </span>
                          )}
                          {isOptionSelected && !isOptionCorrect && (
                            <span className="text-xs font-bold text-rose-700 dark:text-rose-300 flex items-center gap-1 shrink-0 mt-0.5">
                              <XCircle className="w-4 h-4" />
                              <span className="hidden sm:inline">Your Selection</span>
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Summary Comparison Line */}
                  <div className="flex flex-wrap items-center gap-x-6 gap-y-2 p-3 rounded-md bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800 text-xs mb-4">
                    <div className="flex items-center gap-1.5">
                      <span className="text-zinc-500 dark:text-zinc-400">Your Answer:</span>
                      {userAnswer ? (
                        <span
                          className={cn(
                            'font-bold uppercase',
                            isCorrect
                              ? 'text-emerald-700 dark:text-emerald-400'
                              : 'text-rose-700 dark:text-rose-400'
                          )}
                        >
                          Option ({userAnswer.toUpperCase()}) {isCorrect ? '✓ Correct' : '✗ Incorrect'}
                        </span>
                      ) : (
                        <span className="text-zinc-500 dark:text-zinc-400 italic">
                          Not Attempted (Skipped)
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className="text-zinc-500 dark:text-zinc-400">Official ICAI Key:</span>
                      <span className="font-bold uppercase text-emerald-700 dark:text-emerald-400">
                        Option ({q.correctOption.toUpperCase()}) ✓
                      </span>
                    </div>

                    {isMarked && (
                      <div className="flex items-center gap-1 text-amber-700 dark:text-amber-400 font-medium">
                        <Bookmark className="w-3 h-3 fill-current" />
                        <span>Flagged for review</span>
                      </div>
                    )}
                  </div>

                  {/* Stylized Conceptual Explanation Callout Box */}
                  <div className="p-4 rounded-md border border-zinc-200 dark:border-zinc-800 bg-zinc-50/90 dark:bg-zinc-900/80">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider mb-2">
                      <BookOpen className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      <span>ICAI Conceptual Explanation & Reasoning</span>
                    </div>
                    <p className="text-xs sm:text-sm text-zinc-800 dark:text-zinc-200 leading-relaxed font-normal">
                      {q.explanation}
                    </p>
                  </div>
                </Card>
              );
            })
          )}
        </div>

        {/* Right Column: Sticky Verification Matrix Palette Sidebar (4 cols) */}
        <div className="lg:col-span-4 order-1 lg:order-2 lg:sticky lg:top-24">
          <Card className="p-4 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-zinc-100 dark:border-zinc-800">
              <h3 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
                Verification Matrix
              </h3>
              <span className="text-xs font-mono text-zinc-500 dark:text-zinc-400">
                {totalQuestions} Questions
              </span>
            </div>

            <QuestionPalette
              questions={questions}
              currentIndex={selectedQuestionIndex}
              selectedAnswers={selectedAnswers}
              markedForReview={reviewMarkedForReview}
              isReviewMode={true}
              onSelectQuestion={(idx) => {
                setSelectedQuestionIndex(idx);
                const targetQuestion = questions[idx];
                const isAlreadyInView = targetQuestion && filteredQuestions.some((q) => q.id === targetQuestion.id);

                const scrollToTarget = () => {
                  const element = document.getElementById(`review-question-${idx}`);
                  if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    setHighlightedQuestionId(targetQuestion?.id ?? null);
                    setTimeout(() => setHighlightedQuestionId(null), 1500);
                  }
                };

                if (isAlreadyInView) {
                  scrollToTarget();
                } else {
                  setActiveFilter('all');
                  setTimeout(scrollToTarget, 100);
                }
              }}
            />
          </Card>
        </div>
      </div>
    </div>
  </div>
);
};
