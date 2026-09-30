import { describe, it, expect } from 'vitest';
import { calculatePercentage } from '@/lib/utils';
import { evaluateMockSeries } from '@/lib/utils';
import { TestRecord } from '@/types';

describe('Tier 2 - Boundary 2: Extreme Marks & Percentage Calculations', () => {
  it('calculates 0/100 as exactly 0%', () => {
    expect(calculatePercentage(0, 100)).toBe(0);
  });

  it('calculates 100/100 as exactly 100%', () => {
    expect(calculatePercentage(100, 100)).toBe(100);
  });

  it('handles total marks of 0 or negative gracefully without NaN or Infinity', () => {
    expect(calculatePercentage(50, 0)).toBe(0);
    expect(calculatePercentage(50, -10)).toBe(0);
    expect(calculatePercentage(-10, 100)).toBe(0);
  });

  it('clamps percentages exceeding 100% to maximum 100%', () => {
    expect(calculatePercentage(120, 100)).toBe(100);
  });

  it('evaluates mock test series with 0 marks across all 4 papers', () => {
    const zeroTests: TestRecord[] = [
      {
        id: 't1',
        title: 'Mock 1',
        subjectId: 'paper1',
        testType: 'mock',
        dateAttempted: '2026-08-20',
        marksObtained: 0,
        totalMarks: 100,
        percentage: 0,
        isPassed: false,
        createdAt: new Date().toISOString(),
      },
    ];

    const result = evaluateMockSeries(zeroTests);
    expect(result.overallPassed).toBe(false);
    expect(result.aggregatePercentage).toBe(0);
    expect(result.totalMarksObtained).toBe(0);
  });
});
