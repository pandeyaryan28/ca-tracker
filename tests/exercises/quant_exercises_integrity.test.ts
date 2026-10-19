import { describe, it, expect } from 'vitest';
import quantExercisesRaw from '@/data/quantitative_aptitude_exercises.json';
import { SubjectExercisesData, ExerciseAttempt } from '@/types';
import {
  getSubjectExercises,
  getChapterByNumber,
  getUnitByNumber,
  calculateAttemptMetrics,
  saveExerciseAttempt,
  getBestAttempt,
  loadExerciseAttempts,
} from '@/lib/exerciseStorage';

const quantExercises = quantExercisesRaw as unknown as SubjectExercisesData;

describe('Quantitative Aptitude (Paper 3) Exercises Dataset Integrity', () => {
  it('loads valid Paper 3 metadata with 18 chapters and 1,930 questions', () => {
    expect(quantExercises.subjectId).toBe('paper3');
    expect(quantExercises.paperNumber).toBe(3);
    expect(quantExercises.totalChapters).toBe(18);
    expect(quantExercises.chapters.length).toBe(18);
    expect(quantExercises.totalQuestions).toBe(1930);
    expect(quantExercises.negativeMarking).toBe(0.25);
    expect(quantExercises.marksPerQuestion).toBe(1.0);
  });

  it('verifies every chapter has valid number, title, questions, and matching totalQuestions', () => {
    let grandTotalQuestions = 0;

    quantExercises.chapters.forEach((ch, idx) => {
      expect(ch.chapterNumber).toBe(idx + 1);
      expect(ch.chapterId).toMatch(/^qa-ch-\d{2}$/);
      expect(ch.title.trim().length).toBeGreaterThan(0);
      expect(ch.description.trim().length).toBeGreaterThan(0);
      expect(ch.questions.length).toBe(ch.totalQuestions);
      expect(ch.questions.length).toBeGreaterThan(0);

      grandTotalQuestions += ch.questions.length;
    });

    expect(grandTotalQuestions).toBe(1930);
  });

  it('verifies all 1,930 questions have valid text, 4 options, valid answer key, and rich explanations', () => {
    const validKeys = new Set(['a', 'b', 'c', 'd']);

    quantExercises.chapters.forEach((ch) => {
      ch.questions.forEach((q) => {
        expect(q.id).toMatch(/^qa-ch\d{2}-/);
        expect(q.chapterNumber).toBe(ch.chapterNumber);
        expect(q.chapterId).toBe(ch.chapterId);
        expect(q.chapterTitle).toBe(ch.title);
        expect(q.questionText.trim().length).toBeGreaterThan(3);

        // Options validation
        expect(q.options.length).toBe(4);
        const optionKeys = q.options.map((o) => o.key);
        expect(optionKeys).toEqual(['a', 'b', 'c', 'd']);
        q.options.forEach((opt) => {
          expect(opt.text.trim().length).toBeGreaterThan(0);
        });

        // Correct option validation
        expect(validKeys.has(q.correctOption)).toBe(true);

        // Rich mathematical / conceptual explanation
        expect(q.explanation.trim().length).toBeGreaterThan(15);
      });
    });
  });

  it('validates multi-unit and set structures across applicable chapters', () => {
    const multiUnitChapters = quantExercises.chapters.filter((ch) => ch.hasUnits);
    expect(multiUnitChapters.length).toBe(13); // Ch 1, 2, 4, 5, 6, 7, 8, 13, 14, 15, 16, 17, 18

    multiUnitChapters.forEach((ch) => {
      expect(ch.units.length).toBeGreaterThan(1);
      let sumUnitQuestions = 0;

      ch.units.forEach((u) => {
        expect(u.unitNumber).toBeGreaterThan(0);
        expect(u.unitTitle.trim().length).toBeGreaterThan(0);
        expect(u.totalQuestions).toBe(u.questionIds.length);
        expect(u.totalQuestions).toBeGreaterThan(0);
        sumUnitQuestions += u.totalQuestions;

        // Verify questionIds actually exist in chapter
        u.questionIds.forEach((qid) => {
          const found = ch.questions.find((q) => q.id === qid);
          expect(found).toBeDefined();
          expect(found?.unitNumberInChapter).toBe(u.unitNumber);
        });
      });

      expect(sumUnitQuestions).toBe(ch.totalQuestions);
    });
  });

  it('verifies helper functions getChapterByNumber and getUnitByNumber with paper3 subjectId', () => {
    const ch1 = getChapterByNumber(1, 'paper3');
    expect(ch1).toBeDefined();
    expect(ch1?.title).toContain('Ratio and Proportion');
    expect(ch1?.totalQuestions).toBe(222);

    const ch1u1 = getUnitByNumber(1, 1, 'paper3');
    expect(ch1u1).toBeDefined();
    expect(ch1u1?.unitTitle).toContain('Exercise 1(A)');
    expect(ch1u1?.totalQuestions).toBe(25);

    const ch8u2 = getUnitByNumber(8, 2, 'paper3');
    expect(ch8u2).toBeDefined();
    expect(ch8u2?.unitTitle).toContain('Integral Calculus');
  });

  it('calculates attempt metrics for Paper 3 with exact ICAI scoring (+1.00 / -0.25)', () => {
    const ch1 = getChapterByNumber(1, 'paper3')!;
    const testQuestions = ch1.questions.slice(0, 8); // 8 questions

    // Select 5 correct, 2 incorrect, 1 unattempted
    const selectedAnswers: Record<string, 'a' | 'b' | 'c' | 'd'> = {};
    for (let i = 0; i < 5; i++) {
      selectedAnswers[testQuestions[i].id] = testQuestions[i].correctOption;
    }
    // 2 incorrect
    selectedAnswers[testQuestions[5].id] = testQuestions[5].correctOption === 'a' ? 'b' : 'a';
    selectedAnswers[testQuestions[6].id] = testQuestions[6].correctOption === 'a' ? 'b' : 'a';
    // testQuestions[7] unattempted

    const attempt = calculateAttemptMetrics({
      subjectId: 'paper3',
      chapterNumber: 1,
      chapterId: 'qa-ch-01',
      chapterTitle: ch1.title,
      mode: 'exam',
      questions: testQuestions,
      selectedAnswers,
      markedForReview: {},
      startedAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
      timeSpentSeconds: 120,
    });

    expect(attempt.subjectId).toBe('paper3');
    expect(attempt.totalQuestions).toBe(8);
    expect(attempt.attemptedCount).toBe(7);
    expect(attempt.correctCount).toBe(5);
    expect(attempt.incorrectCount).toBe(2);
    expect(attempt.unattemptedCount).toBe(1);
    // Scaled score = 5*1.0 - 2*0.25 = 4.50
    expect(attempt.scaledScore).toBe(4.5);
    // Accuracy = round(5/7 * 100) = 71%
    expect(attempt.accuracyPercentage).toBe(71);
  });

  it('persists Paper 3 attempt and retrieves best attempt filtered by subject', () => {
    localStorage.clear();

    const ch1 = getChapterByNumber(1, 'paper3')!;
    const attempt1: ExerciseAttempt = {
      id: 'qa-attempt-test-1',
      subjectId: 'paper3',
      chapterNumber: 1,
      chapterId: 'qa-ch-01',
      chapterTitle: ch1.title,
      unitNumber: null,
      unitTitle: null,
      mode: 'exam',
      startedAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
      timeSpentSeconds: 100,
      selectedAnswers: {},
      markedForReview: {},
      score: 10,
      scaledScore: 8.5,
      totalQuestions: 25,
      attemptedCount: 12,
      correctCount: 10,
      incorrectCount: 2,
      unattemptedCount: 13,
      accuracyPercentage: 83,
    };

    saveExerciseAttempt(attempt1);

    const loaded = loadExerciseAttempts();
    expect(loaded.length).toBe(1);
    expect(loaded[0].id).toBe('qa-attempt-test-1');

    const bestQa = getBestAttempt(1, null, 'paper3');
    expect(bestQa).toBeDefined();
    expect(bestQa?.scaledScore).toBe(8.5);

    // Filter by paper4 returns undefined because this attempt was for paper3
    const bestEco = getBestAttempt(1, null, 'paper4');
    expect(bestEco).toBeUndefined();
  });
});
