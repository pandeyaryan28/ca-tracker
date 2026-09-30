import { describe, it, expect } from 'vitest';
import { getDaysRemaining, addDaysToDate, getTodayDateString } from '@/lib/utils';
import { calculateStreak } from '@/lib/seedLoader';
import { Topic, RevisionRecord, TestRecord } from '@/types';

describe('Tier 1 - Feature 7: Live Exam Countdown & Daily Study Streak', () => {
  const today = getTodayDateString();

  it('calculates exact days remaining until future target exam date', () => {
    const futureDate = addDaysToDate(today, 60);
    const days = getDaysRemaining(futureDate, today);
    expect(days).toBe(60);
  });

  it('returns non-positive or past days when exam date is in the past', () => {
    const pastDate = addDaysToDate(today, -5);
    const days = getDaysRemaining(pastDate, today);
    expect(days).toBe(-5);
  });

  it('calculates current streak of 1 when active today', () => {
    const mockTopics: Topic[] = [
      {
        id: 'top-1',
        subjectId: 'paper1',
        chapterId: 'acc-ch-01',
        chapterName: 'Accounting',
        title: 'Basic Accounting',
        status: 'completed',
        estimatedMinutes: 60,
        estimatedHours: 1.0,
        completedAt: `${today}T10:00:00.000Z`,
        order: 1,
      },
    ];

    const streak = calculateStreak(mockTopics, [], []);
    expect(streak.currentStreak).toBe(1);
    expect(streak.bestStreak).toBeGreaterThanOrEqual(1);
  });

  it('calculates consecutive multi-day streak accurately', () => {
    const d1 = today;
    const d2 = addDaysToDate(today, -1);
    const d3 = addDaysToDate(today, -2);

    const mockTopics: Topic[] = [
      {
        id: 'top-1',
        subjectId: 'paper1',
        chapterId: 'acc-ch-01',
        chapterName: 'Accounting',
        title: 'Topic 1',
        status: 'completed',
        estimatedMinutes: 60,
        estimatedHours: 1.0,
        completedAt: `${d1}T10:00:00.000Z`,
        order: 1,
      },
      {
        id: 'top-2',
        subjectId: 'paper1',
        chapterId: 'acc-ch-01',
        chapterName: 'Accounting',
        title: 'Topic 2',
        status: 'completed',
        estimatedMinutes: 60,
        estimatedHours: 1.0,
        completedAt: `${d2}T10:00:00.000Z`,
        order: 2,
      },
      {
        id: 'top-3',
        subjectId: 'paper1',
        chapterId: 'acc-ch-01',
        chapterName: 'Accounting',
        title: 'Topic 3',
        status: 'completed',
        estimatedMinutes: 60,
        estimatedHours: 1.0,
        completedAt: `${d3}T10:00:00.000Z`,
        order: 3,
      },
    ];

    const streak = calculateStreak(mockTopics, [], []);
    expect(streak.currentStreak).toBe(3);
    expect(streak.bestStreak).toBe(3);
  });

  it('aggregates activity across revisions and tests for streak calculation', () => {
    const d1 = today;
    const d2 = addDaysToDate(today, -1);

    const mockRevisions: RevisionRecord[] = [
      {
        id: 'rev-1',
        topicId: 'top-1',
        topicTitle: 'Topic 1',
        subjectId: 'paper1',
        cycle: 1,
        lastRevisedDate: d1,
        nextTargetDate: addDaysToDate(d1, 3),
        confidence: 'medium',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    const mockTests: TestRecord[] = [
      {
        id: 'test-1',
        title: 'Mock 1',
        subjectId: 'paper1',
        testType: 'chapter',
        dateAttempted: d2,
        marksObtained: 80,
        totalMarks: 100,
        percentage: 80,
        isPassed: true,
        createdAt: new Date().toISOString(),
      },
    ];

    const streak = calculateStreak([], mockRevisions, mockTests);
    expect(streak.currentStreak).toBe(2);
  });
});
