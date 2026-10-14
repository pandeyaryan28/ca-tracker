import {
  ExerciseAttempt,
  ExerciseQuestion,
  ExerciseOptionKey,
  EconomicsExercisesData,
  ExerciseMode,
} from '@/types';
import { STORAGE_KEYS } from '@/lib/constants';
import rawExercisesData from '@/data/economics_exercises.json';

export const economicsExercises: EconomicsExercisesData = rawExercisesData as unknown as EconomicsExercisesData;

/**
 * Load all stored exercise attempts from LocalStorage
 */
export function loadExerciseAttempts(): ExerciseAttempt[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.EXERCISE_ATTEMPTS);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error('Failed to load exercise attempts from LocalStorage:', err);
    return [];
  }
}

/**
 * Save a new exercise attempt to LocalStorage
 */
export function saveExerciseAttempt(attempt: ExerciseAttempt): void {
  try {
    const existing = loadExerciseAttempts();
    // Prepend latest attempt so recent appears first
    const updated = [attempt, ...existing.filter((a) => a.id !== attempt.id)];
    localStorage.setItem(STORAGE_KEYS.EXERCISE_ATTEMPTS, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to save exercise attempt to LocalStorage:', err);
  }
}

/**
 * Get all attempts for a given chapter
 */
export function getChapterAttempts(chapterNumber: number): ExerciseAttempt[] {
  const all = loadExerciseAttempts();
  return all.filter((a) => a.chapterNumber === chapterNumber);
}

/**
 * Get the best attempt for a chapter (and optionally unit)
 */
export function getBestAttempt(
  chapterNumber: number,
  unitNumber?: number | null
): ExerciseAttempt | undefined {
  const attempts = loadExerciseAttempts().filter((a) => {
    if (a.chapterNumber !== chapterNumber) return false;
    // Exclude custom subset practice attempts (e.g. marked-only or incorrect-only retakes)
    if (a.isCustomSubset) return false;
    if (unitNumber != null) {
      return a.unitNumber === unitNumber;
    }
    return a.unitNumber == null;
  });

  if (attempts.length === 0) return undefined;

  // Best is defined as highest scaled score, with higher accuracy as tiebreaker
  return attempts.reduce((best, curr) => {
    if (curr.scaledScore > best.scaledScore) return curr;
    if (curr.scaledScore === best.scaledScore && curr.accuracyPercentage > best.accuracyPercentage) {
      return curr;
    }
    return best;
  }, attempts[0]);
}

/**
 * Calculate attempt metrics from selected answers according to ICAI scoring rules:
 * - Correct: +1.00 mark
 * - Incorrect: -0.25 mark
 * - Unattempted: 0.00 marks
 */
export function calculateAttemptMetrics(params: {
  chapterNumber: number;
  chapterId: string;
  chapterTitle: string;
  unitNumber?: number | null;
  unitTitle?: string | null;
  mode: ExerciseMode;
  questions: ExerciseQuestion[];
  selectedAnswers: Record<string, ExerciseOptionKey>;
  markedForReview: Record<string, boolean>;
  startedAt: string;
  completedAt: string;
  timeSpentSeconds: number;
  isCustomSubset?: boolean;
}): ExerciseAttempt {
  const {
    chapterNumber,
    chapterId,
    chapterTitle,
    unitNumber,
    unitTitle,
    mode,
    questions,
    selectedAnswers,
    markedForReview,
    startedAt,
    completedAt,
    timeSpentSeconds,
  } = params;

  let correctCount = 0;
  let incorrectCount = 0;
  let unattemptedCount = 0;

  for (const q of questions) {
    const selected = selectedAnswers[q.id];
    if (!selected) {
      unattemptedCount++;
    } else if (selected.toLowerCase() === q.correctOption.toLowerCase()) {
      correctCount++;
    } else {
      incorrectCount++;
    }
  }

  const attemptedCount = correctCount + incorrectCount;
  const totalQuestions = questions.length;
  // Scaled score with CA Foundation Paper 4 negative marking of 0.25
  const scaledScore = Math.max(0, correctCount * 1.0 - incorrectCount * 0.25);
  const accuracyPercentage =
    attemptedCount > 0 ? Math.round((correctCount / attemptedCount) * 100) : 0;

  const attemptId = `attempt-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

  return {
    id: attemptId,
    chapterNumber,
    chapterId,
    chapterTitle,
    unitNumber: unitNumber ?? null,
    unitTitle: unitTitle ?? null,
    mode,
    startedAt,
    completedAt,
    timeSpentSeconds,
    selectedAnswers,
    markedForReview,
    score: correctCount,
    scaledScore: Number(scaledScore.toFixed(2)),
    totalQuestions,
    attemptedCount,
    correctCount,
    incorrectCount,
    unattemptedCount,
    accuracyPercentage,
    isCustomSubset: Boolean(params.isCustomSubset),
  };
}

/**
 * Helper to get a chapter by number
 */
export function getChapterByNumber(chapterNumber: number) {
  return economicsExercises.chapters.find((c) => c.chapterNumber === chapterNumber);
}

/**
 * Helper to get a unit within a chapter
 */
export function getUnitByNumber(chapterNumber: number, unitNumber: number) {
  const ch = getChapterByNumber(chapterNumber);
  if (!ch) return undefined;
  return ch.units.find((u) => u.unitNumber === unitNumber);
}
