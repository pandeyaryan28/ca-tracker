import { describe, it, expect } from 'vitest';
import { calculateDashboardMetrics, generateActionPlan } from '@/lib/seedLoader';
import { DEFAULT_USER_SETTINGS } from '@/lib/constants';
import { Topic, TestRecord } from '@/types';

describe('Tier 2 - Boundary 1: Zero & Null Metrics Edge Cases', () => {
  it('calculates metrics safely with 0 topics, 0 tests, 0 revisions', () => {
    const metrics = calculateDashboardMetrics([], [], [], DEFAULT_USER_SETTINGS);
    expect(metrics.totalTopics).toBe(0);
    expect(metrics.completedTopics).toBe(0);
    expect(metrics.overallProgressPercentage).toBe(0);
    expect(metrics.totalTestsLogged).toBe(0);
    expect(metrics.recentTestsAveragePercentage).toBe(0);
  });

  it('handles null or empty examDate safely in metrics', () => {
    const settings = { ...DEFAULT_USER_SETTINGS, examDate: '' };
    const metrics = calculateDashboardMetrics([], [], [], settings);
    expect(typeof metrics.daysUntilExam).toBe('number');
    expect(metrics.overallProgressPercentage).toBe(0);
  });

  it('generates action plan cleanly when topics and revisions are empty', () => {
    const plan = generateActionPlan([], [], []);
    expect(plan).toEqual([]);
  });

  it('handles topics with zero or positive estimated minutes', () => {
    const mockTopics: Topic[] = [
      {
        id: 'top-zero',
        subjectId: 'paper1',
        chapterId: 'acc-ch-01',
        chapterName: 'Accounting',
        title: 'Zero Duration Topic',
        status: 'pending',
        estimatedMinutes: 60,
        estimatedHours: 1.0,
        order: 1,
      },
    ];
    const metrics = calculateDashboardMetrics(mockTopics, [], [], DEFAULT_USER_SETTINGS);
    expect(metrics.totalTopics).toBe(1);
    expect(metrics.completedTopics).toBe(0);
  });

  it('handles tests with undefined or empty weakTopics array', () => {
    const mockTests: TestRecord[] = [
      {
        id: 't-empty',
        title: 'Test Empty Weak Topics',
        subjectId: 'paper1',
        testType: 'chapter',
        dateAttempted: '2026-08-20',
        marksObtained: 50,
        totalMarks: 100,
        percentage: 50,
        isPassed: true,
        createdAt: new Date().toISOString(),
      },
    ];
    const metrics = calculateDashboardMetrics([], mockTests, [], DEFAULT_USER_SETTINGS);
    expect(metrics.totalTestsLogged).toBe(1);
  });
});
