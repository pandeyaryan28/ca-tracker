import { describe, it, expect } from 'vitest';
import { evaluateMockSeries } from '@/lib/utils';
import { TestRecord } from '@/types';

describe('Tier 2 - Boundary 11: Mock Evaluation Boundary Scores (40% / 50% Thresholds)', () => {
  it('qualifies candidate when all papers are exactly 40% and total is 200 (50.0%)', () => {
    const tests: TestRecord[] = [
      { id: '1', title: 'P1', subjectId: 'paper1', testType: 'mock', dateAttempted: '2026-08-20', marksObtained: 50, totalMarks: 100, percentage: 50, isPassed: true, createdAt: '' },
      { id: '2', title: 'P2', subjectId: 'paper2', testType: 'mock', dateAttempted: '2026-08-20', marksObtained: 50, totalMarks: 100, percentage: 50, isPassed: true, createdAt: '' },
      { id: '3', title: 'P3', subjectId: 'paper3', testType: 'mock', dateAttempted: '2026-08-20', marksObtained: 50, totalMarks: 100, percentage: 50, isPassed: true, createdAt: '' },
      { id: '4', title: 'P4', subjectId: 'paper4', testType: 'mock', dateAttempted: '2026-08-20', marksObtained: 50, totalMarks: 100, percentage: 50, isPassed: true, createdAt: '' },
    ];

    const res = evaluateMockSeries(tests);
    expect(res.aggregatePercentage).toBe(50);
    expect(res.totalMarksObtained).toBe(200);
    expect(res.overallPassed).toBe(true);
  });

  it('fails candidate when aggregate is 199 / 400 (49.8%) even if all individual papers >= 40%', () => {
    const tests: TestRecord[] = [
      { id: '1', title: 'P1', subjectId: 'paper1', testType: 'mock', dateAttempted: '2026-08-20', marksObtained: 49, totalMarks: 100, percentage: 49, isPassed: true, createdAt: '' },
      { id: '2', title: 'P2', subjectId: 'paper2', testType: 'mock', dateAttempted: '2026-08-20', marksObtained: 50, totalMarks: 100, percentage: 50, isPassed: true, createdAt: '' },
      { id: '3', title: 'P3', subjectId: 'paper3', testType: 'mock', dateAttempted: '2026-08-20', marksObtained: 50, totalMarks: 100, percentage: 50, isPassed: true, createdAt: '' },
      { id: '4', title: 'P4', subjectId: 'paper4', testType: 'mock', dateAttempted: '2026-08-20', marksObtained: 50, totalMarks: 100, percentage: 50, isPassed: true, createdAt: '' },
    ];

    const res = evaluateMockSeries(tests);
    expect(res.totalMarksObtained).toBe(199);
    expect(res.aggregatePercentage).toBe(49.8);
    expect(res.aggregatePassed).toBe(false);
    expect(res.overallPassed).toBe(false);
    expect(res.statusMessage).toContain('Aggregate < 50%');
  });

  it('fails candidate when single paper is 39.5% even if total score is 300/400 (75%)', () => {
    const tests: TestRecord[] = [
      { id: '1', title: 'P1', subjectId: 'paper1', testType: 'mock', dateAttempted: '2026-08-20', marksObtained: 90, totalMarks: 100, percentage: 90, isPassed: true, createdAt: '' },
      { id: '2', title: 'P2', subjectId: 'paper2', testType: 'mock', dateAttempted: '2026-08-20', marksObtained: 39.5, totalMarks: 100, percentage: 39.5, isPassed: false, createdAt: '' },
      { id: '3', title: 'P3', subjectId: 'paper3', testType: 'mock', dateAttempted: '2026-08-20', marksObtained: 90, totalMarks: 100, percentage: 90, isPassed: true, createdAt: '' },
      { id: '4', title: 'P4', subjectId: 'paper4', testType: 'mock', dateAttempted: '2026-08-20', marksObtained: 90, totalMarks: 100, percentage: 90, isPassed: true, createdAt: '' },
    ];

    const res = evaluateMockSeries(tests);
    expect(res.totalMarksObtained).toBe(309.5);
    expect(res.allPapersPassedIndividual).toBe(false);
    expect(res.overallPassed).toBe(false);
    expect(res.statusMessage).toContain('Individual Paper < 40%');
  });

  it('qualifies candidate with exactly 40.0% in Paper 2 and high scores in other papers', () => {
    const tests: TestRecord[] = [
      { id: '1', title: 'P1', subjectId: 'paper1', testType: 'mock', dateAttempted: '2026-08-20', marksObtained: 60, totalMarks: 100, percentage: 60, isPassed: true, createdAt: '' },
      { id: '2', title: 'P2', subjectId: 'paper2', testType: 'mock', dateAttempted: '2026-08-20', marksObtained: 40, totalMarks: 100, percentage: 40, isPassed: true, createdAt: '' },
      { id: '3', title: 'P3', subjectId: 'paper3', testType: 'mock', dateAttempted: '2026-08-20', marksObtained: 60, totalMarks: 100, percentage: 60, isPassed: true, createdAt: '' },
      { id: '4', title: 'P4', subjectId: 'paper4', testType: 'mock', dateAttempted: '2026-08-20', marksObtained: 60, totalMarks: 100, percentage: 60, isPassed: true, createdAt: '' },
    ];

    const res = evaluateMockSeries(tests);
    expect(res.individualPaperPass.paper2).toBe(true);
    expect(res.overallPassed).toBe(true);
  });

  it('handles tests logged out of order by picking the most recent date for each paper', () => {
    const tests: TestRecord[] = [
      { id: '1', title: 'P1 New', subjectId: 'paper1', testType: 'mock', dateAttempted: '2026-08-25', marksObtained: 70, totalMarks: 100, percentage: 70, isPassed: true, createdAt: '' },
      { id: '2', title: 'P1 Old', subjectId: 'paper1', testType: 'mock', dateAttempted: '2026-08-10', marksObtained: 30, totalMarks: 100, percentage: 30, isPassed: false, createdAt: '' },
    ];

    const res = evaluateMockSeries(tests);
    expect(res.paperScores.paper1).toBe(70);
  });
});
