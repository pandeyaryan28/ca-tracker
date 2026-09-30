import { describe, it, expect } from 'vitest';
import { calculateStreak } from '@/lib/seedLoader';
import { addDaysToDate, getTodayDateString } from '@/lib/utils';
import { Topic, RevisionRecord, TestRecord } from '@/types';

describe('Tier 3 - Combination 8: Continuous Study Streak Across Multiple Activity Types', () => {
  const today = getTodayDateString();
  const dMinus1 = addDaysToDate(today, -1);
  const dMinus2 = addDaysToDate(today, -2);
  const dMinus3 = addDaysToDate(today, -3);

  it('calculates unbroken 4-day streak combining topic completion, revision, and mock test', () => {
    // Day 0 (today): Topic completed
    const topics: Topic[] = [
      {
        id: 'top-1',
        subjectId: 'paper1',
        chapterId: 'ch1',
        chapterName: 'Ch 1',
        title: 'Topic 1',
        status: 'completed',
        completedAt: `${today}T14:00:00.000Z`,
        order: 1,
      },
    ];

    // Day -1: Revision reviewed
    const revisions: RevisionRecord[] = [
      {
        id: 'rev-1',
        topicId: 'top-rev',
        topicTitle: 'Topic Rev',
        subjectId: 'paper2',
        cycle: 1,
        lastRevisedDate: dMinus1,
        nextTargetDate: addDaysToDate(dMinus1, 3),
        confidence: 'medium',
        createdAt: '',
        updatedAt: '',
      },
    ];

    // Day -2 and Day -3: Tests attempted
    const tests: TestRecord[] = [
      {
        id: 't-1',
        title: 'Mock 1',
        subjectId: 'paper3',
        testType: 'chapter',
        dateAttempted: dMinus2,
        marksObtained: 80,
        totalMarks: 100,
        percentage: 80,
        isPassed: true,
        createdAt: '',
      },
      {
        id: 't-2',
        title: 'Mock 2',
        subjectId: 'paper4',
        testType: 'chapter',
        dateAttempted: dMinus3,
        marksObtained: 75,
        totalMarks: 100,
        percentage: 75,
        isPassed: true,
        createdAt: '',
      },
    ];

    const streak = calculateStreak(topics, revisions, tests);
    expect(streak.currentStreak).toBe(4);
    expect(streak.bestStreak).toBeGreaterThanOrEqual(4);
  });
});
