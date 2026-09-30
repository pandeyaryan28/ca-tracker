import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { DataProvider, useData } from '@/context/DataContext';
import {
  loadSeedSyllabus,
  buildSubjectGroups,
  calculateStreak,
  normalizeSubjectId,
} from '@/lib/seedLoader';
import { getDaysRemaining, formatDate, calculatePercentage, formatMinutes, formatHours, addDaysToDate } from '@/lib/utils';
import { Topic, TestRecord, RevisionRecord } from '@/types';

const wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <DataProvider>{children}</DataProvider>
);

describe('Remediation & Hardening: 5 Core Edge Cases Suite', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('Issue 1: Dynamic Custom Chapter/Topic Grouping in buildSubjectGroups', () => {
    it('synthesizes dynamic chapters for custom topics with non-seed chapterIds', () => {
      const seed = loadSeedSyllabus();
      const customTopic1: Topic = {
        id: 'custom-t-1',
        subjectId: 'paper1',
        chapterId: 'paper1-custom-ch',
        chapterName: 'Custom Practice Problems',
        title: 'Extra RTP Nov 2026',
        status: 'pending',
        estimatedMinutes: 90,
        estimatedHours: 1.5,
        order: 200,
        isCustom: true,
      };

      const customTopic2: Topic = {
        id: 'custom-t-2',
        subjectId: 'paper1',
        chapterId: 'paper1-custom-ch',
        chapterName: 'Custom Practice Problems',
        title: 'Extra MTP Dec 2026',
        status: 'completed',
        estimatedMinutes: 60,
        estimatedHours: 1.0,
        order: 201,
        isCustom: true,
      };

      const customTopicOtherPaper: Topic = {
        id: 'custom-t-3',
        subjectId: 'paper3',
        chapterId: 'paper3-custom-calc',
        chapterName: 'Calculator Tricks & Shortcuts',
        title: 'Time Value of Money Speed Drills',
        status: 'in_progress',
        estimatedMinutes: 45,
        estimatedHours: 0.8,
        order: 202,
        isCustom: true,
      };

      const allTopics = [...seed.topics, customTopic1, customTopic2, customTopicOtherPaper];
      const groups = buildSubjectGroups(allTopics, seed.chapters, seed.subjects);

      // Paper 1 should now have 11 seed chapters + 1 synthesized custom chapter = 12 chapters
      expect(groups.paper1.chapters).toHaveLength(12);
      const customCh = groups.paper1.chapters.find((c) => c.id === 'paper1-custom-ch');
      expect(customCh).toBeDefined();
      expect(customCh?.title).toBe('Custom Practice Problems');
      expect(customCh?.topics).toHaveLength(2);
      expect(customCh?.totalTopicsCount).toBe(2);
      expect(customCh?.completedTopicsCount).toBe(1);
      expect(customCh?.progressPercentage).toBe(50);

      // Paper 3 should have 18 seed chapters + 1 synthesized chapter = 19 chapters
      expect(groups.paper3.chapters).toHaveLength(19);
      const p3CustomCh = groups.paper3.chapters.find((c) => c.id === 'paper3-custom-calc');
      expect(p3CustomCh).toBeDefined();
      expect(p3CustomCh?.topics).toHaveLength(1);
      expect(p3CustomCh?.topics[0].title).toBe('Time Value of Money Speed Drills');
    });

    it('dynamically reflects custom topics added via useData context into subjectGroups', () => {
      const { result } = renderHook(() => useData(), { wrapper });

      act(() => {
        result.current.addTopic({
          subjectId: 'paper2',
          chapterId: 'paper2-custom-contracts',
          chapterName: 'Special Contract Drafting',
          title: 'Bailment and Pledge Case Studies',
          status: 'pending',
          estimatedMinutes: 120,
          estimatedHours: 2.0,
        });
      });

      const paper2Group = result.current.subjectGroups.paper2;
      expect(paper2Group.totalTopics).toBe(21); // 20 seed + 1 custom
      const customChapter = paper2Group.chapters.find((c) => c.id === 'paper2-custom-contracts');
      expect(customChapter).toBeDefined();
      expect(customChapter?.title).toBe('Special Contract Drafting');
      expect(customChapter?.topics).toHaveLength(1);
      expect(customChapter?.topics[0].title).toBe('Bailment and Pledge Case Studies');
    });
  });

  describe('Issue 2: Safe Date Parsing in UPDATE_TOPIC_STATUS', () => {
    it('gracefully handles invalid customDate strings without throwing RangeError', () => {
      const { result } = renderHook(() => useData(), { wrapper });
      const targetTopic = result.current.topics[0];

      expect(() => {
        act(() => {
          result.current.updateTopicStatus(targetTopic.id, 'completed', 'corrupted-timestamp-1234');
        });
      }).not.toThrow();

      const updated = result.current.topics.find((t) => t.id === targetTopic.id);
      expect(updated?.status).toBe('completed');
      expect(updated?.completedAt).toBeDefined();
      expect(Number.isNaN(new Date(updated!.completedAt!).getTime())).toBe(false);
    });

    it('preserves valid customDate when provided', () => {
      const { result } = renderHook(() => useData(), { wrapper });
      const targetTopic = result.current.topics[1];
      const validDate = '2026-06-15T10:30:00.000Z';

      act(() => {
        result.current.updateTopicStatus(targetTopic.id, 'completed', validDate);
      });

      const updated = result.current.topics.find((t) => t.id === targetTopic.id);
      expect(updated?.completedAt).toBe(validDate);
    });
  });

  describe('Issue 3: NaN Guard in getDaysRemaining and Date Utilities', () => {
    it('returns 0 for corrupted or invalid date strings in getDaysRemaining', () => {
      expect(getDaysRemaining('invalid-date')).toBe(0);
      expect(getDaysRemaining('2026-99-99')).toBe(0);
      expect(getDaysRemaining('')).toBe(0);
      expect(getDaysRemaining(null as any)).toBe(0);
      expect(getDaysRemaining(undefined as any)).toBe(0);
      expect(getDaysRemaining('abc-def-ghi')).toBe(0);
    });

    it('calculates correct integer days remaining for valid dates', () => {
      const fromDate = '2026-08-01T00:00:00';
      const targetDate = '2026-08-11';
      const days = getDaysRemaining(targetDate, fromDate);
      expect(days).toBe(10);
    });

    it('guards calculatePercentage against division by zero, NaN, and non-finite numbers', () => {
      expect(calculatePercentage(10, 0)).toBe(0);
      expect(calculatePercentage(10, -5)).toBe(0);
      expect(calculatePercentage(NaN, 100)).toBe(0);
      expect(calculatePercentage(50, NaN)).toBe(0);
      expect(calculatePercentage(Infinity, 100)).toBe(0);
      expect(calculatePercentage(50, 100)).toBe(50);
      expect(calculatePercentage(150, 100)).toBe(100); // Clamped at 100
    });

    it('guards formatDate and addDaysToDate against malformed inputs', () => {
      expect(formatDate(null)).toBe('Not set');
      expect(formatDate(undefined)).toBe('Not set');
      expect(formatDate('invalid-date')).toBe('invalid-date');

      const shifted = addDaysToDate('2026-08-28', 5);
      expect(shifted).toBe('2026-09-02');

      const fallbackShift = addDaysToDate('invalid-date', 3);
      expect(typeof fallbackShift).toBe('string');
      expect(fallbackShift.split('-')).toHaveLength(3);
    });
  });

  describe('Issue 4: totalMarks <= 0 Guard in Test Series', () => {
    it('sets percentage=0 and isPassed=false when totalMarks=0 in addTest', () => {
      const { result } = renderHook(() => useData(), { wrapper });

      act(() => {
        result.current.addTest({
          title: 'Zero Total Marks Quiz',
          subjectId: 'paper1',
          testType: 'chapter',
          dateAttempted: '2026-08-28',
          marksObtained: 0,
          totalMarks: 0,
        });
      });

      const added = result.current.tests[0];
      expect(added.percentage).toBe(0);
      expect(added.isPassed).toBe(false);
      expect(result.current.metrics.recentTestsAveragePercentage).toBe(0);
    });

    it('sets percentage=0 and isPassed=false when totalMarks is negative', () => {
      const { result } = renderHook(() => useData(), { wrapper });

      act(() => {
        result.current.addTest({
          title: 'Negative Total Marks Test',
          subjectId: 'paper2',
          testType: 'unit',
          dateAttempted: '2026-08-28',
          marksObtained: 25,
          totalMarks: -50,
        });
      });

      const added = result.current.tests[0];
      expect(added.percentage).toBe(0);
      expect(added.isPassed).toBe(false);
      expect(Number.isFinite(result.current.metrics.recentTestsAveragePercentage)).toBe(true);
    });

    it('guards updateTest against setting totalMarks to 0', () => {
      const { result } = renderHook(() => useData(), { wrapper });

      act(() => {
        result.current.addTest({
          title: 'Initial Valid Test',
          subjectId: 'paper3',
          testType: 'mock',
          dateAttempted: '2026-08-28',
          marksObtained: 80,
          totalMarks: 100,
        });
      });

      const testId = result.current.tests[0].id;
      expect(result.current.tests[0].percentage).toBe(80);

      act(() => {
        result.current.updateTest(testId, { totalMarks: 0 });
      });

      const updated = result.current.tests.find((t) => t.id === testId);
      expect(updated?.percentage).toBe(0);
      expect(updated?.isPassed).toBe(false);
    });
  });

  describe('Issue 5: Graceful Skipping of Corrupted Dates in calculateStreak', () => {
    it('filters out invalid date strings without throwing RangeError', () => {
      const topicsWithBadDates: Topic[] = [
        {
          ...resultPlaceholderTopic(),
          id: 'top-bad-1',
          completedAt: '2026-99-99T00:00:00Z',
        },
        {
          ...resultPlaceholderTopic(),
          id: 'top-bad-2',
          completedAt: 'unparseable-date',
        },
      ];

      const revisionsWithBadDates: RevisionRecord[] = [
        {
          id: 'rev-bad-1',
          topicId: 'top-bad-1',
          topicTitle: 'Topic Bad',
          subjectId: 'paper1',
          cycle: 1,
          lastRevisedDate: '2026-13-45',
          nextTargetDate: '2026-14-01',
          confidence: 'low',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];

      const testsWithBadDates: TestRecord[] = [
        {
          id: 'test-bad-1',
          title: 'Bad Date Test',
          subjectId: 'paper1',
          testType: 'chapter',
          dateAttempted: '2026-00-00',
          marksObtained: 50,
          totalMarks: 100,
          percentage: 50,
          isPassed: true,
          createdAt: new Date().toISOString(),
        },
      ];

      expect(() => {
        const streak = calculateStreak(topicsWithBadDates, revisionsWithBadDates, testsWithBadDates);
        expect(streak.currentStreak).toBe(0);
        expect(streak.bestStreak).toBe(0);
      }).not.toThrow();
    });

    it('calculates accurate streak when valid dates are interspersed with invalid dates', () => {
      const today = new Date().toISOString().split('T')[0];
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      const mixedTopics: Topic[] = [
        {
          ...resultPlaceholderTopic(),
          id: 'top-valid-1',
          completedAt: `${yesterdayStr}T10:00:00Z`,
        },
        {
          ...resultPlaceholderTopic(),
          id: 'top-valid-2',
          completedAt: `${today}T12:00:00Z`,
        },
        {
          ...resultPlaceholderTopic(),
          id: 'top-corrupted',
          completedAt: '2026-99-99',
        },
      ];

      const streak = calculateStreak(mixedTopics, [], []);
      expect(streak.currentStreak).toBe(2);
      expect(streak.bestStreak).toBe(2);
    });
  });

  describe('Additional Robustness: normalizeSubjectId and formatting helpers', () => {
    it('handles null, undefined, numeric, and mixed case inputs in normalizeSubjectId', () => {
      expect(normalizeSubjectId(undefined)).toBe('paper1');
      expect(normalizeSubjectId(null)).toBe('paper1');
      expect(normalizeSubjectId('')).toBe('paper1');
      expect(normalizeSubjectId(1)).toBe('paper1');
      expect(normalizeSubjectId(2)).toBe('paper2');
      expect(normalizeSubjectId(3)).toBe('paper3');
      expect(normalizeSubjectId(4)).toBe('paper4');
      expect(normalizeSubjectId('PAPER-2-BUSINESS-LAWS')).toBe('paper2');
      expect(normalizeSubjectId('paper3-qa')).toBe('paper3');
      expect(normalizeSubjectId('economics')).toBe('paper4');
    });

    it('handles formatting utilities with invalid numbers', () => {
      expect(formatMinutes(0)).toBe('0m');
      expect(formatMinutes(-10)).toBe('0m');
      expect(formatMinutes(NaN)).toBe('0m');
      expect(formatMinutes(90)).toBe('1h 30m');
      expect(formatHours(0)).toBe('0 hrs');
      expect(formatHours(-5)).toBe('0 hrs');
      expect(formatHours(NaN)).toBe('0 hrs');
      expect(formatHours(2.5)).toBe('2.5 hrs');
    });
  });
});

function resultPlaceholderTopic(): Topic {
  return {
    id: 'placeholder-topic',
    subjectId: 'paper1',
    chapterId: 'acc-ch-01',
    chapterName: 'Theoretical Framework',
    title: 'Placeholder Topic',
    status: 'completed',
    estimatedMinutes: 60,
    estimatedHours: 1.0,
    order: 1,
    isCustom: false,
  };
}
