import { describe, it, expect } from 'vitest';
import { generateActionPlan } from '@/lib/seedLoader';
import { getTodayDateString, addDaysToDate } from '@/lib/utils';
import { Topic, RevisionRecord } from '@/types';

describe('Tier 2 - Boundary 15: Action Plan Priority Sorting & Overdue Bounds', () => {
  const today = getTodayDateString();

  it('assigns High priority to topics overdue by 30+ days', () => {
    const pastDate = addDaysToDate(today, -30);
    const topics: Topic[] = [
      {
        id: 't-old',
        subjectId: 'paper1',
        chapterId: 'ch1',
        chapterName: 'Ch 1',
        title: 'Very Old Pending Topic',
        status: 'pending',
        estimatedMinutes: 60,
        estimatedHours: 1.0,
        targetDate: pastDate,
        order: 1,
      },
    ];

    const plan = generateActionPlan(topics, [], []);
    expect(plan).toHaveLength(1);
    expect(plan[0].priority).toBe('high');
    expect(plan[0].isOverdue).toBe(true);
  });

  it('assigns Medium priority to topics due today', () => {
    const topics: Topic[] = [
      {
        id: 't-today',
        subjectId: 'paper2',
        chapterId: 'ch2',
        chapterName: 'Ch 2',
        title: 'Topic Due Today',
        status: 'pending',
        estimatedMinutes: 60,
        estimatedHours: 1.0,
        targetDate: today,
        order: 1,
      },
    ];

    const plan = generateActionPlan(topics, [], []);
    expect(plan).toHaveLength(1);
    expect(plan[0].priority).toBe('medium');
    expect(plan[0].isOverdue).toBe(false);
  });

  it('prioritizes overdue items before due-today items in sorted action plan', () => {
    const pastDate = addDaysToDate(today, -3);
    const topics: Topic[] = [
      {
        id: 't-today',
        subjectId: 'paper1',
        chapterId: 'ch1',
        chapterName: 'Ch 1',
        title: 'Today Topic',
        status: 'pending',
        estimatedMinutes: 60,
        estimatedHours: 1.0,
        targetDate: today,
        order: 1,
      },
      {
        id: 't-overdue',
        subjectId: 'paper2',
        chapterId: 'ch2',
        chapterName: 'Ch 2',
        title: 'Overdue Topic',
        status: 'pending',
        estimatedMinutes: 60,
        estimatedHours: 1.0,
        targetDate: pastDate,
        order: 2,
      },
    ];

    const plan = generateActionPlan(topics, [], []);
    expect(plan).toHaveLength(2);
    expect(plan[0].topicId).toBe('t-overdue');
    expect(plan[1].topicId).toBe('t-today');
  });

  it('includes overdue spaced revisions alongside overdue topics', () => {
    const pastDate = addDaysToDate(today, -2);
    const revs: RevisionRecord[] = [
      {
        id: 'rev-overdue',
        topicId: 'top-rev',
        topicTitle: 'Overdue Revision Review',
        subjectId: 'paper3',
        cycle: 2,
        lastRevisedDate: addDaysToDate(today, -10),
        nextTargetDate: pastDate,
        confidence: 'medium',
        createdAt: '',
        updatedAt: '',
      },
    ];

    const plan = generateActionPlan([], revs, []);
    expect(plan).toHaveLength(1);
    expect(plan[0].isOverdue).toBe(true);
  });

  it('excludes topics scheduled in the future from the daily action plan', () => {
    const futureDate = addDaysToDate(today, 5);
    const topics: Topic[] = [
      {
        id: 't-future',
        subjectId: 'paper4',
        chapterId: 'ch4',
        chapterName: 'Ch 4',
        title: 'Future Topic',
        status: 'pending',
        estimatedMinutes: 60,
        estimatedHours: 1.0,
        targetDate: futureDate,
        order: 1,
      },
    ];

    const plan = generateActionPlan(topics, [], []);
    expect(plan).toHaveLength(0);
  });
});
