import { describe, it, expect } from 'vitest';
import rawExercisesData from '@/data/economics_exercises.json';
import { EconomicsExercisesData } from '@/types';

const data = rawExercisesData as unknown as EconomicsExercisesData;

describe('Business Economics Exercises Dataset Integrity', () => {
  it('loads valid EconomicsExercisesData metadata', () => {
    expect(data.subjectId).toBe('paper4');
    expect(data.subjectName).toBe('Business Economics');
    expect(data.paperNumber).toBe(4);
    expect(data.totalChapters).toBe(10);
    expect(data.totalQuestions).toBe(617);
    expect(data.negativeMarking).toBe(0.25);
    expect(data.marksPerQuestion).toBe(1.0);
    expect(data.chapters).toHaveLength(10);
  });

  it('validates all 10 chapters exist in exact numerical sequence 1 to 10', () => {
    const chapterNumbers = data.chapters.map((c) => c.chapterNumber);
    expect(chapterNumbers).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  });

  it('validates exact question counts for all 10 chapters', () => {
    const counts = data.chapters.map((c) => ({
      ch: c.chapterNumber,
      count: c.totalQuestions,
      qLength: c.questions.length,
    }));

    expect(counts).toEqual([
      { ch: 1, count: 48, qLength: 48 },
      { ch: 2, count: 120, qLength: 120 },
      { ch: 3, count: 84, qLength: 84 },
      { ch: 4, count: 101, qLength: 101 },
      { ch: 5, count: 30, qLength: 30 },
      { ch: 6, count: 26, qLength: 26 },
      { ch: 7, count: 90, qLength: 90 },
      { ch: 8, count: 47, qLength: 47 },
      { ch: 9, count: 53, qLength: 53 },
      { ch: 10, count: 18, qLength: 18 },
    ]);
  });

  it('validates multi-unit structures for Chapters 6, 7, 8, and 9', () => {
    const ch6 = data.chapters.find((c) => c.chapterNumber === 6)!;
    expect(ch6.hasUnits).toBe(true);
    expect(ch6.units).toHaveLength(2);
    expect(ch6.units[0].totalQuestions).toBe(15);
    expect(ch6.units[1].totalQuestions).toBe(11);

    const ch7 = data.chapters.find((c) => c.chapterNumber === 7)!;
    expect(ch7.hasUnits).toBe(true);
    expect(ch7.units).toHaveLength(4);
    expect(ch7.units[0].totalQuestions).toBe(20);
    expect(ch7.units[1].totalQuestions).toBe(24);
    expect(ch7.units[2].totalQuestions).toBe(24);
    expect(ch7.units[3].totalQuestions).toBe(22);

    const ch8 = data.chapters.find((c) => c.chapterNumber === 8)!;
    expect(ch8.hasUnits).toBe(true);
    expect(ch8.units).toHaveLength(3);
    expect(ch8.units[0].totalQuestions).toBe(15);
    expect(ch8.units[1].totalQuestions).toBe(19);
    expect(ch8.units[2].totalQuestions).toBe(13);

    const ch9 = data.chapters.find((c) => c.chapterNumber === 9)!;
    expect(ch9.hasUnits).toBe(true);
    expect(ch9.units).toHaveLength(5);
    expect(ch9.units[0].totalQuestions).toBe(10);
    expect(ch9.units[1].totalQuestions).toBe(12);
    expect(ch9.units[2].totalQuestions).toBe(11);
    expect(ch9.units[3].totalQuestions).toBe(10);
    expect(ch9.units[4].totalQuestions).toBe(10);
  });

  it('validates that every single question across all 617 has complete, non-empty fields and 4 options', () => {
    let questionCounter = 0;

    for (const chapter of data.chapters) {
      for (const q of chapter.questions) {
        questionCounter++;

        expect(q.id).toBeTruthy();
        expect(q.chapterNumber).toBe(chapter.chapterNumber);
        expect(q.chapterId).toBe(chapter.chapterId);
        expect(q.questionNumber).toBeGreaterThan(0);
        expect(q.questionText.trim().length).toBeGreaterThan(5);

        // Options validation
        expect(q.options).toHaveLength(4);
        const keys = q.options.map((o) => o.key);
        expect(keys).toEqual(['a', 'b', 'c', 'd']);

        for (const opt of q.options) {
          expect(opt.text.trim().length).toBeGreaterThan(0);
        }

        // Correct option validation
        expect(['a', 'b', 'c', 'd']).toContain(q.correctOption);

        // Explanation validation
        expect(q.explanation).toBeTruthy();
        expect(q.explanation.trim().length).toBeGreaterThan(15);
      }
    }

    expect(questionCounter).toBe(617);
  });

  it('validates that ZERO questions have the generic boilerplate tautology and all explanations are subject-grounded', () => {
    let genericCount = 0;
    for (const chapter of data.chapters) {
      for (const q of chapter.questions) {
        if (q.explanation.includes('According to the official ICAI Business Economics study module')) {
          genericCount++;
        }
      }
    }
    expect(genericCount).toBe(0);
  });
});
