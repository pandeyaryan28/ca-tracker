import { describe, it, expect, beforeEach } from 'vitest';
import {
  calculateAttemptMetrics,
  saveExerciseAttempt,
  loadExerciseAttempts,
  getBestAttempt,
  getChapterAttempts,
} from '@/lib/exerciseStorage';
import { ExerciseQuestion, ExerciseAttempt } from '@/types';
import { STORAGE_KEYS } from '@/lib/constants';

const mockQuestions: ExerciseQuestion[] = [
  {
    id: 'test-q-1',
    chapterNumber: 1,
    chapterId: 'eco-ch-01',
    chapterTitle: 'Nature & Scope of Business Economics',
    questionNumber: 1,
    questionText: 'Test Question 1',
    options: [
      { key: 'a', text: 'Option A' },
      { key: 'b', text: 'Option B' },
      { key: 'c', text: 'Option C' },
      { key: 'd', text: 'Option D' },
    ],
    correctOption: 'a',
    explanation: 'Explanation 1',
  },
  {
    id: 'test-q-2',
    chapterNumber: 1,
    chapterId: 'eco-ch-01',
    chapterTitle: 'Nature & Scope of Business Economics',
    questionNumber: 2,
    questionText: 'Test Question 2',
    options: [
      { key: 'a', text: 'Option A' },
      { key: 'b', text: 'Option B' },
      { key: 'c', text: 'Option C' },
      { key: 'd', text: 'Option D' },
    ],
    correctOption: 'b',
    explanation: 'Explanation 2',
  },
  {
    id: 'test-q-3',
    chapterNumber: 1,
    chapterId: 'eco-ch-01',
    chapterTitle: 'Nature & Scope of Business Economics',
    questionNumber: 3,
    questionText: 'Test Question 3',
    options: [
      { key: 'a', text: 'Option A' },
      { key: 'b', text: 'Option B' },
      { key: 'c', text: 'Option C' },
      { key: 'd', text: 'Option D' },
    ],
    correctOption: 'c',
    explanation: 'Explanation 3',
  },
  {
    id: 'test-q-4',
    chapterNumber: 1,
    chapterId: 'eco-ch-01',
    chapterTitle: 'Nature & Scope of Business Economics',
    questionNumber: 4,
    questionText: 'Test Question 4',
    options: [
      { key: 'a', text: 'Option A' },
      { key: 'b', text: 'Option B' },
      { key: 'c', text: 'Option C' },
      { key: 'd', text: 'Option D' },
    ],
    correctOption: 'd',
    explanation: 'Explanation 4',
  },
];

describe('Exercise Scoring and Storage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('correctly calculates metrics with CA Foundation negative marking (+1.00 / -0.25)', () => {
    // 2 correct (q1=a, q2=b), 1 incorrect (q3=a instead of c), 1 skipped (q4)
    const metrics = calculateAttemptMetrics({
      chapterNumber: 1,
      chapterId: 'eco-ch-01',
      chapterTitle: 'Nature & Scope of Business Economics',
      mode: 'exam',
      questions: mockQuestions,
      selectedAnswers: {
        'test-q-1': 'a',
        'test-q-2': 'b',
        'test-q-3': 'a', // incorrect
      },
      markedForReview: {
        'test-q-2': true,
        'test-q-3': true,
      },
      startedAt: '2026-10-14T06:00:00.000Z',
      completedAt: '2026-10-14T06:05:00.000Z',
      timeSpentSeconds: 300,
    });

    expect(metrics.totalQuestions).toBe(4);
    expect(metrics.attemptedCount).toBe(3);
    expect(metrics.correctCount).toBe(2);
    expect(metrics.incorrectCount).toBe(1);
    expect(metrics.unattemptedCount).toBe(1);
    expect(metrics.score).toBe(2);
    // Scaled score = 2 * 1.0 - 1 * 0.25 = 1.75
    expect(metrics.scaledScore).toBe(1.75);
    // Accuracy = 2 / 3 = 67%
    expect(metrics.accuracyPercentage).toBe(67);
    // Marked for review persists
    expect(metrics.markedForReview['test-q-2']).toBe(true);
    expect(metrics.markedForReview['test-q-3']).toBe(true);
    expect(metrics.markedForReview['test-q-1']).toBeFalsy();
  });

  it('persists and loads attempts from LocalStorage', () => {
    const attempt: ExerciseAttempt = {
      id: 'att-123',
      chapterNumber: 1,
      chapterId: 'eco-ch-01',
      chapterTitle: 'Nature & Scope of Business Economics',
      mode: 'exam',
      startedAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
      timeSpentSeconds: 120,
      selectedAnswers: { 'test-q-1': 'a' },
      markedForReview: { 'test-q-1': true },
      score: 1,
      scaledScore: 1.0,
      totalQuestions: 4,
      attemptedCount: 1,
      correctCount: 1,
      incorrectCount: 0,
      unattemptedCount: 3,
      accuracyPercentage: 100,
    };

    saveExerciseAttempt(attempt);

    const loaded = loadExerciseAttempts();
    expect(loaded).toHaveLength(1);
    expect(loaded[0].id).toBe('att-123');
    expect(loaded[0].markedForReview['test-q-1']).toBe(true);

    const chapterAttempts = getChapterAttempts(1);
    expect(chapterAttempts).toHaveLength(1);

    const best = getBestAttempt(1);
    expect(best?.id).toBe('att-123');
  });

  it('correctly picks the best attempt by scaled score', () => {
    const attempt1: ExerciseAttempt = {
      id: 'att-1',
      chapterNumber: 6,
      chapterId: 'eco-ch-06',
      chapterTitle: 'Determination of National Income',
      unitNumber: 1,
      unitTitle: 'Unit 1: National Income Accounting',
      mode: 'exam',
      startedAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
      timeSpentSeconds: 200,
      selectedAnswers: {},
      markedForReview: {},
      score: 8,
      scaledScore: 7.25,
      totalQuestions: 15,
      attemptedCount: 10,
      correctCount: 8,
      incorrectCount: 2,
      unattemptedCount: 5,
      accuracyPercentage: 80,
    };

    const attempt2: ExerciseAttempt = {
      id: 'att-2',
      chapterNumber: 6,
      chapterId: 'eco-ch-06',
      chapterTitle: 'Determination of National Income',
      unitNumber: 1,
      unitTitle: 'Unit 1: National Income Accounting',
      mode: 'exam',
      startedAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
      timeSpentSeconds: 250,
      selectedAnswers: {},
      markedForReview: {},
      score: 12,
      scaledScore: 11.5,
      totalQuestions: 15,
      attemptedCount: 14,
      correctCount: 12,
      incorrectCount: 2,
      unattemptedCount: 1,
      accuracyPercentage: 86,
    };

    saveExerciseAttempt(attempt1);
    saveExerciseAttempt(attempt2);

    const best = getBestAttempt(6, 1);
    expect(best?.id).toBe('att-2');
    expect(best?.scaledScore).toBe(11.5);
  });

  it('excludes custom subset attempts (marked/incorrect only) from official best attempt lookups', () => {
    // A subset retake of only 2 questions with 100% score (2.0)
    const subsetAttempt: ExerciseAttempt = {
      id: 'att-subset-1',
      chapterNumber: 6,
      chapterId: 'eco-ch-06',
      chapterTitle: 'Determination of National Income',
      unitNumber: 1,
      unitTitle: 'Unit 1: National Income Accounting',
      mode: 'practice',
      startedAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
      timeSpentSeconds: 30,
      selectedAnswers: {},
      markedForReview: {},
      score: 2,
      scaledScore: 2.0,
      totalQuestions: 2,
      attemptedCount: 2,
      correctCount: 2,
      incorrectCount: 0,
      unattemptedCount: 0,
      accuracyPercentage: 100,
      isCustomSubset: true, // Marked as custom subset practice!
    };

    saveExerciseAttempt(subsetAttempt);

    // Official best attempt must ignore the subset attempt
    const best = getBestAttempt(6, 1);
    expect(best?.id).not.toBe('att-subset-1');
  });
});
