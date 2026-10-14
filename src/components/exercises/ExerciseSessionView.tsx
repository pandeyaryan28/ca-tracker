import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Clock,
  Bookmark,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  XCircle,
  Pause,
  Play,
  Grid,
  X,
  BookOpen,
  Keyboard,
  Check,
} from 'lucide-react';
import {
  ExerciseQuestion,
  ExerciseOptionKey,
  ExerciseMode,
  ExerciseAttempt,
} from '@/types';
import { calculateAttemptMetrics, saveExerciseAttempt } from '@/lib/exerciseStorage';
import { QuestionPalette } from './QuestionPalette';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { cn } from '@/lib/utils';

interface ExerciseSessionViewProps {
  chapterNumber: number;
  chapterId: string;
  chapterTitle: string;
  unitNumber?: number | null;
  unitTitle?: string | null;
  mode: ExerciseMode;
  questions: ExerciseQuestion[];
  isCustomSubset?: boolean;
  onComplete: (attempt: ExerciseAttempt) => void;
  onExit: () => void;
}

export const ExerciseSessionView: React.FC<ExerciseSessionViewProps> = ({
  chapterNumber,
  chapterId,
  chapterTitle,
  unitNumber,
  unitTitle,
  mode,
  questions,
  isCustomSubset,
  onComplete,
  onExit,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, ExerciseOptionKey>>({});
  const [markedForReview, setMarkedForReview] = useState<Record<string, boolean>>({});
  const [showPaletteModal, setShowPaletteModal] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showPracticeAnswer, setShowPracticeAnswer] = useState<Record<string, boolean>>({});

  // Timer states (60 seconds per question allocated in exam mode)
  const initialExamSeconds = questions.length * 60;
  const [timeRemainingSeconds, setTimeRemainingSeconds] = useState(initialExamSeconds);
  const [timeElapsedSeconds, setTimeElapsedSeconds] = useState(0);
  const [isTimerPaused, setIsTimerPaused] = useState(false);

  const startTimeRef = useRef<string>(new Date().toISOString());

  const currentQ = questions[currentIndex];
  const totalQuestions = questions.length;
  const answeredCount = Object.keys(selectedAnswers).length;
  const markedCount = Object.values(markedForReview).filter(Boolean).length;
  const unansweredCount = totalQuestions - answeredCount;

  const handleSelectOption = useCallback((key: ExerciseOptionKey) => {
    if (!currentQ) return;
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentQ.id]: key,
    }));
  }, [currentQ]);

  const handleClearOption = useCallback(() => {
    if (!currentQ) return;
    setSelectedAnswers((prev) => {
      const next = { ...prev };
      delete next[currentQ.id];
      return next;
    });
    setShowPracticeAnswer((prev) => ({
      ...prev,
      [currentQ.id]: false,
    }));
  }, [currentQ]);

  const handleToggleMarkForReview = useCallback(() => {
    if (!currentQ) return;
    setMarkedForReview((prev) => ({
      ...prev,
      [currentQ.id]: !prev[currentQ.id],
    }));
  }, [currentQ]);

  const handleTogglePracticeAnswer = useCallback(() => {
    if (!currentQ) return;
    setShowPracticeAnswer((prev) => ({
      ...prev,
      [currentQ.id]: !prev[currentQ.id],
    }));
  }, [currentQ]);

  const handlePrev = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  }, [currentIndex]);

  const handleNext = useCallback(() => {
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  }, [currentIndex, totalQuestions]);

  const handleFinalSubmit = useCallback(() => {
    const completedAt = new Date().toISOString();
    const timeSpent = timeElapsedSeconds;

    const attempt = calculateAttemptMetrics({
      chapterNumber,
      chapterId,
      chapterTitle,
      unitNumber,
      unitTitle,
      mode,
      questions,
      selectedAnswers,
      markedForReview,
      startedAt: startTimeRef.current,
      completedAt,
      timeSpentSeconds: timeSpent,
      isCustomSubset,
    });

    saveExerciseAttempt(attempt);
    onComplete(attempt);
  }, [
    chapterNumber,
    chapterId,
    chapterTitle,
    unitNumber,
    unitTitle,
    mode,
    questions,
    selectedAnswers,
    markedForReview,
    timeElapsedSeconds,
    isCustomSubset,
    onComplete,
  ]);

  // Timer tick effect
  useEffect(() => {
    if (isTimerPaused) return;

    const timer = setInterval(() => {
      setTimeElapsedSeconds((prev) => prev + 1);

      if (mode === 'exam') {
        setTimeRemainingSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            handleFinalSubmit();
            return 0;
          }
          return prev - 1;
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [isTimerPaused, mode, handleFinalSubmit]);

  // Keyboard Shortcuts Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts when modals are open or user is in form inputs
      if (
        showSubmitModal ||
        showPaletteModal ||
        ['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)
      ) {
        return;
      }

      const key = e.key.toLowerCase();

      // Number keys or letter keys for options
      if (key === '1' || key === 'a') {
        e.preventDefault();
        handleSelectOption('a');
      } else if (key === '2' || key === 'b') {
        e.preventDefault();
        handleSelectOption('b');
      } else if (key === '3') {
        e.preventDefault();
        handleSelectOption('c');
      } else if (key === '4' || key === 'd') {
        e.preventDefault();
        handleSelectOption('d');
      } else if (key === 'backspace' || key === 'delete') {
        e.preventDefault();
        handleClearOption();
      } else if (key === 'c') {
        e.preventDefault();
        // If an option is currently selected, 'c' clears it (ICAI Clear Response shortcut).
        // If nothing is selected, 'c' selects Option C.
        if (selectedAnswers[currentQ?.id]) {
          handleClearOption();
        } else {
          handleSelectOption('c');
        }
      } else if (key === 'arrowright' || key === 'enter') {
        e.preventDefault();
        if (currentIndex < totalQuestions - 1) {
          handleNext();
        } else {
          setShowSubmitModal(true);
        }
      } else if (key === 'arrowleft') {
        e.preventDefault();
        if (currentIndex > 0) {
          handlePrev();
        }
      } else if (key === 'm' || key === 'r') {
        e.preventDefault();
        handleToggleMarkForReview();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    showSubmitModal,
    showPaletteModal,
    currentIndex,
    totalQuestions,
    currentQ,
    selectedAnswers,
    handleSelectOption,
    handleNext,
    handlePrev,
    handleToggleMarkForReview,
    handleClearOption,
  ]);

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const isCurrentMarked = Boolean(markedForReview[currentQ?.id]);
  const currentSelectedOption = selectedAnswers[currentQ?.id];
  const isPracticeAnswerVisible = Boolean(showPracticeAnswer[currentQ?.id]);
  const progressPercentage = totalQuestions > 0 ? Math.round(((currentIndex + 1) / totalQuestions) * 100) : 0;
  const displayUnitTitle = unitTitle || currentQ?.unitTitle;

  return (
    <div className="flex flex-col min-h-[calc(100vh-5rem)] max-w-6xl mx-auto px-4 py-6 gap-6 select-none">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700">
              Chapter {chapterNumber}
            </span>
            {displayUnitTitle && (
              <span className="text-xs font-medium px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800 truncate max-w-xs">
                {displayUnitTitle}
              </span>
            )}
            <span
              className={cn(
                'text-xs font-semibold px-2 py-0.5 rounded-md uppercase tracking-wider border',
                mode === 'exam'
                  ? 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-900/60'
                  : 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-900/60'
              )}
            >
              {mode === 'exam' ? 'Exam Mode (-0.25 mark)' : 'Practice Mode'}
            </span>
          </div>
          <h2 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-100 truncate">
            {chapterTitle}
          </h2>
        </div>

        {/* Live Timer & Action Buttons */}
        <div className="flex items-center gap-2.5 w-full sm:w-auto justify-between sm:justify-end shrink-0">
          {/* Timer Container */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/80">
            <Clock className="w-4 h-4 text-zinc-500 dark:text-zinc-400 shrink-0" />
            <div className="flex flex-col">
              <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-medium uppercase leading-tight">
                {mode === 'exam' ? 'Time Left' : 'Elapsed Time'}
              </span>
              <span className="font-mono text-sm font-bold text-zinc-900 dark:text-zinc-100 leading-tight">
                {formatTime(mode === 'exam' ? timeRemainingSeconds : timeElapsedSeconds)}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setIsTimerPaused(!isTimerPaused)}
              className="p-1 rounded-md text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors ml-1 cursor-pointer"
              title={isTimerPaused ? 'Resume Timer' : 'Pause Timer'}
              aria-label={isTimerPaused ? 'Resume Timer' : 'Pause Timer'}
            >
              {isTimerPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* Question Palette Trigger Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowPaletteModal(true)}
            className="flex items-center gap-1.5 lg:hidden"
            title="Open Question Palette"
          >
            <Grid className="w-4 h-4" />
            <span className="hidden sm:inline">Palette</span>
            <span className="text-xs font-mono font-bold text-zinc-700 dark:text-zinc-300">
              {totalQuestions > 0 ? currentIndex + 1 : 0}/{totalQuestions}
            </span>
          </Button>

          {/* Submit Test Button */}
          <Button
            variant="primary"
            size="sm"
            onClick={() => setShowSubmitModal(true)}
            className="bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white font-semibold shadow-sm"
          >
            Submit
          </Button>

          {/* Exit Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onExit}
            className="text-xs text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
            title="Exit exercise without saving"
          >
            Exit
          </Button>
        </div>
      </div>

      {/* Main Content Area: 12-column Grid for balanced breathing room */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Question Card & Controls (8 cols) */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          <Card className="p-6 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm">
            {/* Session Progress Bar */}
            <div className="mb-4">
              <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 mb-1.5 font-medium">
                <span>
                  Progress: {totalQuestions > 0 ? currentIndex + 1 : 0} of {totalQuestions}
                </span>
                <span>{progressPercentage}% Complete</span>
              </div>
              <div className="w-full h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-sm overflow-hidden border border-zinc-200/50 dark:border-zinc-700/50">
                <div
                  className="h-full bg-zinc-900 dark:bg-zinc-100 transition-all duration-300"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </div>

            {/* Question Header & Mark for Review Button */}
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-zinc-100 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900">
                  Question {currentIndex + 1}
                </span>
                {currentQ.unitTitle && (
                  <span className="text-xs text-zinc-500 dark:text-zinc-400 hidden sm:inline">
                    • {currentQ.unitTitle}
                  </span>
                )}
              </div>

              {/* Mark for Review Toggle Button */}
              <button
                type="button"
                onClick={handleToggleMarkForReview}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all duration-150 cursor-pointer border',
                  isCurrentMarked
                    ? 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950/70 dark:text-amber-200 dark:border-amber-700/70'
                    : 'bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700'
                )}
                title={isCurrentMarked ? 'Unmark Question [Shortcut: M]' : 'Mark Question for Review [Shortcut: M]'}
              >
                <Bookmark className={cn('w-3.5 h-3.5', isCurrentMarked && 'fill-current')} />
                <span>{isCurrentMarked ? 'Marked for Review' : 'Mark for Review'}</span>
                <span className="text-[10px] opacity-60 ml-0.5">[M]</span>
              </button>
            </div>

            {/* Context Box (Tables, case figures, or problem prompt) */}
            {currentQ.context && currentQ.context.trim() && !/test your knowledge/i.test(currentQ.context) && !/multiple choice/i.test(currentQ.context) && (
              <div className="mb-5 p-4 rounded-md border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/60 font-mono text-xs text-zinc-800 dark:text-zinc-200 whitespace-pre-wrap leading-relaxed overflow-x-auto">
                {currentQ.context}
              </div>
            )}

            {/* Question Text Prompt */}
            <div className="text-base sm:text-lg font-medium text-zinc-900 dark:text-zinc-100 leading-relaxed mb-6">
              {currentQ.questionText}
            </div>

            {/* Options List with Enhanced Interactive Touch Targets */}
            <div className="flex flex-col gap-3">
              {currentQ.options.map((option, idx) => {
                const isSelected = currentSelectedOption === option.key;
                const optionShortcuts = ['1', '2', '3', '4'];
                const shortcutKey = optionShortcuts[idx] || option.key.toUpperCase();

                return (
                  <button
                    key={option.key}
                    type="button"
                    onClick={() => handleSelectOption(option.key)}
                    className={cn(
                      'group flex items-center justify-between gap-3.5 p-4 min-h-[48px] rounded-md border text-left transition-all duration-150 cursor-pointer text-sm leading-snug',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 dark:focus-visible:ring-zinc-100 focus-visible:ring-offset-2',
                      isSelected
                        ? 'border-zinc-900 bg-zinc-100 dark:border-zinc-100 dark:bg-zinc-800/95 text-zinc-950 dark:text-white font-medium ring-1 ring-zinc-900 dark:ring-zinc-100 shadow-sm'
                        : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 hover:border-zinc-300 dark:hover:border-zinc-700 hover:bg-zinc-50/70 dark:hover:bg-zinc-800/40'
                    )}
                  >
                    <div className="flex items-start gap-3.5 flex-1">
                      <span
                        className={cn(
                          'flex items-center justify-center w-7 h-7 rounded-md text-xs font-bold uppercase shrink-0 transition-colors',
                          isSelected
                            ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                            : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400 group-hover:bg-zinc-200 dark:group-hover:bg-zinc-700'
                        )}
                      >
                        {option.key}
                      </span>
                      <span className="flex-1 mt-0.5">{option.text}</span>
                    </div>

                    {/* Keyboard Shortcut Hint & Selection Checkmark */}
                    <div className="flex items-center gap-2 shrink-0">
                      {isSelected ? (
                        <span className="p-1 rounded-md bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                          <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                        </span>
                      ) : (
                        <span className="hidden sm:inline-block text-[11px] font-mono text-zinc-400 dark:text-zinc-500 px-1.5 py-0.5 rounded-md border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800">
                          [{shortcutKey}]
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Practice Mode Instant Check Button & Explanation Box */}
            {mode === 'practice' && (
              <div className="mt-6 pt-5 border-t border-zinc-100 dark:border-zinc-800 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleTogglePracticeAnswer}
                    disabled={!currentSelectedOption}
                    className="flex items-center gap-1.5"
                    title={!currentSelectedOption ? 'Select an option first to check answer' : undefined}
                  >
                    <BookOpen className="w-4 h-4" />
                    <span>{isPracticeAnswerVisible ? 'Hide Explanation' : 'Check Answer & Explanation'}</span>
                  </Button>

                  {currentSelectedOption && !isPracticeAnswerVisible && (
                    <span className="text-xs text-zinc-500 dark:text-zinc-400">
                      Click to reveal official answer and reasoning
                    </span>
                  )}
                </div>

                {/* Instant Feedback Banner */}
                {isPracticeAnswerVisible && (
                  <div
                    className={cn(
                      'p-4 rounded-md border text-xs leading-relaxed transition-all duration-200',
                      currentSelectedOption?.toLowerCase() === currentQ.correctOption.toLowerCase()
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-100'
                        : 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800 text-rose-900 dark:text-rose-100'
                    )}
                  >
                    <div className="flex items-center gap-2 font-bold mb-1.5 text-sm">
                      {currentSelectedOption?.toLowerCase() === currentQ.correctOption.toLowerCase() ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                          <span>Correct Answer!</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                          <span>Incorrect. Official Answer is ({currentQ.correctOption.toUpperCase()})</span>
                        </>
                      )}
                    </div>
                    <div className="mt-2 text-zinc-800 dark:text-zinc-200">
                      <strong className="block text-zinc-900 dark:text-zinc-100 mb-1">
                        Conceptual Explanation:
                      </strong>
                      {currentQ.explanation}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Subtle Keyboard Navigation Legend Bar */}
            <div className="mt-6 pt-4 border-t border-zinc-100 dark:border-zinc-800/60 hidden md:flex items-center justify-between text-[11px] text-zinc-500 dark:text-zinc-400">
              <div className="flex items-center gap-1.5 font-medium">
                <Keyboard className="w-3.5 h-3.5 text-zinc-400" />
                <span>Shortcuts:</span>
              </div>
              <div className="flex items-center gap-3 font-mono">
                <span>[1-4] or [A-D] Select</span>
                <span>•</span>
                <span>[←/→] Navigate</span>
                <span>•</span>
                <span>[M/R] Mark</span>
                <span>•</span>
                <span>[C/Backspace] Clear</span>
                <span>•</span>
                <span>[Enter] Next / Submit</span>
              </div>
            </div>
          </Card>

          {/* Bottom Action Navigation Toolbar */}
          <div className="flex items-center justify-between gap-3 p-4 rounded-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className="flex items-center gap-1.5"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </Button>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearOption}
                disabled={!currentSelectedOption}
                className="text-xs text-zinc-600 dark:text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400"
              >
                Clear Selection
              </Button>
            </div>

            {currentIndex < totalQuestions - 1 ? (
              <Button
                variant="primary"
                size="sm"
                onClick={handleNext}
                className="flex items-center gap-1.5 font-semibold"
              >
                <span>Next</span>
                <ChevronRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button
                variant="primary"
                size="sm"
                onClick={() => setShowSubmitModal(true)}
                className="bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 text-white flex items-center gap-1.5 font-semibold"
              >
                <span>Finish & Submit</span>
              </Button>
            )}
          </div>
        </div>

        {/* Right Column: Desktop Persistent Question Palette (4 cols) */}
        <div className="hidden lg:block lg:col-span-4">
          <Card className="p-4 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm sticky top-24">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-zinc-100 dark:border-zinc-800">
              <h3 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
                Question Palette
              </h3>
              <span className="text-xs font-mono text-zinc-500 dark:text-zinc-400">
                {answeredCount}/{totalQuestions}
              </span>
            </div>

            <QuestionPalette
              questions={questions}
              currentIndex={currentIndex}
              selectedAnswers={selectedAnswers}
              markedForReview={markedForReview}
              onSelectQuestion={(idx) => setCurrentIndex(idx)}
            />
          </Card>
        </div>
      </div>

      {/* Mobile/Tablet Palette Modal */}
      {showPaletteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md max-h-[90vh] overflow-y-auto p-6 rounded-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xl flex flex-col gap-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
              <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                Question Palette
              </h3>
              <button
                type="button"
                onClick={() => setShowPaletteModal(false)}
                className="p-1 rounded-md text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 cursor-pointer"
                aria-label="Close question palette"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <QuestionPalette
              questions={questions}
              currentIndex={currentIndex}
              selectedAnswers={selectedAnswers}
              markedForReview={markedForReview}
              onSelectQuestion={(idx) => {
                setCurrentIndex(idx);
                setShowPaletteModal(false);
              }}
            />

            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowPaletteModal(false)}
              className="w-full mt-1"
            >
              Close
            </Button>
          </div>
        </div>
      )}

      {/* Submit Confirmation Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md max-h-[90vh] overflow-y-auto p-6 rounded-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xl flex flex-col gap-4">
            <div>
              <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                Submit Exercise?
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                You are about to submit your attempt. Here is your current progress summary:
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2 p-3 rounded-md bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-center">
              <div>
                <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                  {answeredCount}
                </div>
                <div className="text-[11px] text-zinc-500 dark:text-zinc-400 font-medium">
                  Answered
                </div>
              </div>
              <div>
                <div className="text-xl font-bold text-amber-600 dark:text-amber-400">
                  {markedCount}
                </div>
                <div className="text-[11px] text-zinc-500 dark:text-zinc-400 font-medium">
                  Marked
                </div>
              </div>
              <div>
                <div className="text-xl font-bold text-zinc-600 dark:text-zinc-400">
                  {unansweredCount}
                </div>
                <div className="text-[11px] text-zinc-500 dark:text-zinc-400 font-medium">
                  Unanswered
                </div>
              </div>
            </div>

            {markedCount > 0 && (
              <p className="text-xs text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 p-2.5 rounded-md border border-amber-200 dark:border-amber-800">
                Notice: You have <strong>{markedCount}</strong> questions marked for review. You can review them in detail on the post-submission verification matrix.
              </p>
            )}

            {unansweredCount > 0 && (
              <p className="text-xs text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800/70 p-2.5 rounded-md border border-zinc-200 dark:border-zinc-700">
                You have <strong>{unansweredCount}</strong> unattempted questions that will be marked as skipped (0.00 marks).
              </p>
            )}

            <div className="flex items-center gap-3 mt-2">
              <Button
                variant="outline"
                size="md"
                onClick={() => setShowSubmitModal(false)}
                className="flex-1"
              >
                Keep Testing
              </Button>
              <Button
                variant="primary"
                size="md"
                onClick={() => {
                  setShowSubmitModal(false);
                  handleFinalSubmit();
                }}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
              >
                Confirm & Submit
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
