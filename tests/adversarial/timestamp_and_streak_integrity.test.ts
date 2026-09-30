import { calculateStreak } from '@/lib/seedLoader';
import { getDaysRemaining, addDaysToDate, formatMinutes, formatHours, calculatePercentage } from '@/lib/utils';
import { TestRecord } from '@/types';

describe('Adversarial Stress Test: Timestamp, Date Arithmetic & Streak Calculations', () => {
  it('returns {0, 0} streak when no activity is present', () => {
    const streak = calculateStreak([], [], []);
    expect(streak.currentStreak).toBe(0);
    expect(streak.bestStreak).toBe(0);
  });

  it('calculates streak across consecutive days spanning month boundaries', () => {
    // 2026-01-30, 2026-01-31, 2026-02-01, 2026-02-02 (4 days consecutive)
    const tests: TestRecord[] = [
      { id: 't1', title: 'T1', subjectId: 'paper1', testType: 'mock', dateAttempted: '2026-01-30', marksObtained: 50, totalMarks: 100, percentage: 50, isPassed: true, createdAt: '2026-01-30T10:00:00Z' },
      { id: 't2', title: 'T2', subjectId: 'paper1', testType: 'mock', dateAttempted: '2026-01-31', marksObtained: 50, totalMarks: 100, percentage: 50, isPassed: true, createdAt: '2026-01-31T10:00:00Z' },
      { id: 't3', title: 'T3', subjectId: 'paper1', testType: 'mock', dateAttempted: '2026-02-01', marksObtained: 50, totalMarks: 100, percentage: 50, isPassed: true, createdAt: '2026-02-01T10:00:00Z' },
      { id: 't4', title: 'T4', subjectId: 'paper1', testType: 'mock', dateAttempted: '2026-02-02', marksObtained: 50, totalMarks: 100, percentage: 50, isPassed: true, createdAt: '2026-02-02T10:00:00Z' },
    ];

    const streak = calculateStreak([], [], tests);
    expect(streak.bestStreak).toBe(4);
  });

  it('calculates streak across leap year February (2024-02-28 -> 2024-02-29 -> 2024-03-01)', () => {
    const tests: TestRecord[] = [
      { id: 't1', title: 'T1', subjectId: 'paper1', testType: 'mock', dateAttempted: '2024-02-28', marksObtained: 50, totalMarks: 100, percentage: 50, isPassed: true, createdAt: '2024-02-28T10:00:00Z' },
      { id: 't2', title: 'T2', subjectId: 'paper1', testType: 'mock', dateAttempted: '2024-02-29', marksObtained: 50, totalMarks: 100, percentage: 50, isPassed: true, createdAt: '2024-02-29T10:00:00Z' },
      { id: 't3', title: 'T3', subjectId: 'paper1', testType: 'mock', dateAttempted: '2024-03-01', marksObtained: 50, totalMarks: 100, percentage: 50, isPassed: true, createdAt: '2024-03-01T10:00:00Z' },
    ];

    const streak = calculateStreak([], [], tests);
    expect(streak.bestStreak).toBe(3);
  });

  it('calculates streak across year transitions (2025-12-31 -> 2026-01-01)', () => {
    const tests: TestRecord[] = [
      { id: 't1', title: 'T1', subjectId: 'paper1', testType: 'mock', dateAttempted: '2025-12-31', marksObtained: 50, totalMarks: 100, percentage: 50, isPassed: true, createdAt: '2025-12-31T10:00:00Z' },
      { id: 't2', title: 'T2', subjectId: 'paper1', testType: 'mock', dateAttempted: '2026-01-01', marksObtained: 50, totalMarks: 100, percentage: 50, isPassed: true, createdAt: '2026-01-01T10:00:00Z' },
    ];

    const streak = calculateStreak([], [], tests);
    expect(streak.bestStreak).toBe(2);
  });

  it('handles multiple activities on the same date without inflating streak count', () => {
    const tests: TestRecord[] = [];
    for (let i = 0; i < 50; i++) {
      tests.push({
        id: `t-${i}`,
        title: `Test ${i}`,
        subjectId: 'paper1',
        testType: 'chapter',
        dateAttempted: '2026-05-15',
        marksObtained: 80,
        totalMarks: 100,
        percentage: 80,
        isPassed: true,
        createdAt: `2026-05-15T1${i % 10}:00:00Z`,
      });
    }

    const streak = calculateStreak([], [], tests);
    expect(streak.bestStreak).toBe(1);
  });

  it('correctly computes addDaysToDate across month/year boundary and leap years', () => {
    expect(addDaysToDate('2026-01-31', 1)).toBe('2026-02-01');
    expect(addDaysToDate('2026-02-28', 1)).toBe('2026-03-01');
    expect(addDaysToDate('2024-02-28', 1)).toBe('2024-02-29'); // Leap year 2024
    expect(addDaysToDate('2024-02-29', 1)).toBe('2024-03-01');
    expect(addDaysToDate('2025-12-31', 1)).toBe('2026-01-01');
    expect(addDaysToDate('2026-08-28', 14)).toBe('2026-09-11');
  });

  it('calculates getDaysRemaining robustly with boundary cases', () => {
    // Exact same date
    expect(getDaysRemaining('2026-11-01', '2026-11-01')).toBe(0);
    // 1 day remaining
    expect(getDaysRemaining('2026-11-02', '2026-11-01')).toBe(1);
    // Past date (negative or past)
    expect(getDaysRemaining('2026-10-31', '2026-11-01')).toBe(-1);
    // Corrupted date string yields 0 in hardened implementation
    expect(getDaysRemaining('invalid-date')).toBe(0);
  });

  it('formats edge case durations and minutes gracefully', () => {
    expect(formatMinutes(0)).toBe('0m');
    expect(formatMinutes(-10)).toBe('0m');
    expect(formatMinutes(45)).toBe('45m');
    expect(formatMinutes(60)).toBe('1h');
    expect(formatMinutes(90)).toBe('1h 30m');
    expect(formatMinutes(125)).toBe('2h 5m');

    expect(formatHours(0)).toBe('0 hrs');
    expect(formatHours(1)).toBe('1 hrs');
    expect(formatHours(1.5)).toBe('1.5 hrs');
    expect(formatHours(-5)).toBe('0 hrs');
  });

  it('calculates percentages with boundary clamping [0, 100]', () => {
    expect(calculatePercentage(0, 100)).toBe(0);
    expect(calculatePercentage(50, 100)).toBe(50);
    expect(calculatePercentage(100, 100)).toBe(100);
    expect(calculatePercentage(150, 100)).toBe(100); // Clamped to 100
    expect(calculatePercentage(-10, 100)).toBe(0); // Clamped to 0
    expect(calculatePercentage(50, 0)).toBe(0); // Zero total safe
  });
});
