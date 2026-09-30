import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { DataProvider, useData } from '@/context/DataContext';
import { loadSeedSyllabus } from '@/lib/seedLoader';
import { DEFAULT_USER_SETTINGS } from '@/lib/constants';

const wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <DataProvider>{children}</DataProvider>
);

describe('Adversarial Stress Test: Syllabus Reset & Integrity', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('performs total factory reset when called with empty options', () => {
    const { result } = renderHook(() => useData(), { wrapper });

    // Mutate state deeply
    act(() => {
      // Complete 10 topics
      for (let i = 0; i < 10; i++) {
        result.current.updateTopicStatus(result.current.topics[i].id, 'completed');
      }
      // Add custom topic
      result.current.addTopic({
        subjectId: 'paper1',
        chapterId: 'paper1-custom',
        chapterName: 'Custom Practice',
        title: 'Custom Reset Topic',
        status: 'completed',
        estimatedMinutes: 45,
        estimatedHours: 0.8,
      });
      // Add test record
      result.current.addTest({
        title: 'Diagnostic Test',
        subjectId: 'paper1',
        testType: 'mock',
        dateAttempted: '2026-08-28',
        marksObtained: 85,
        totalMarks: 100,
      });
      // Update settings
      result.current.updateSettings({
        userName: 'ChangedName',
        dailyGoalHours: 12.0,
      });
    });

    expect(result.current.topics.length).toBe(100);
    expect(result.current.metrics.completedTopics).toBe(11);
    expect(result.current.tests.length).toBe(1);
    expect(result.current.settings.userName).toBe('ChangedName');

    // Execute Factory Reset (with preserveSettings: false)
    act(() => {
      result.current.resetToDefaultSyllabus({ preserveSettings: false });
    });

    // Verify pristine baseline
    const freshSeed = loadSeedSyllabus();
    expect(result.current.topics).toHaveLength(99);
    expect(result.current.tests).toHaveLength(0);
    expect(result.current.revisions).toHaveLength(0);
    expect(result.current.settings.userName).toBe(DEFAULT_USER_SETTINGS.userName);
    expect(result.current.settings.dailyGoalHours).toBe(DEFAULT_USER_SETTINGS.dailyGoalHours);
    expect(result.current.metrics.completedTopics).toBe(0);
    expect(result.current.metrics.overallProgressPercentage).toBe(0);

    // Deep compare all 99 topics
    for (let i = 0; i < 99; i++) {
      expect(result.current.topics[i].id).toBe(freshSeed.topics[i].id);
      expect(result.current.topics[i].status).toBe('pending');
      expect(result.current.topics[i].startedAt).toBeUndefined();
      expect(result.current.topics[i].completedAt).toBeUndefined();
      expect(result.current.topics[i].order).toBe(freshSeed.topics[i].order);
    }
  });

  it('preserves custom topics while resetting all default topics to pending', () => {
    const { result } = renderHook(() => useData(), { wrapper });

    act(() => {
      // Complete first 5 default topics
      result.current.updateTopicStatus(result.current.topics[0].id, 'completed');
      result.current.updateTopicStatus(result.current.topics[1].id, 'completed');
      
      // Add 2 custom topics
      result.current.addTopic({
        subjectId: 'paper2',
        chapterId: 'paper2-custom',
        chapterName: 'Custom Law Review',
        title: 'Custom Law Case Studies',
        status: 'in_progress',
        estimatedMinutes: 120,
        estimatedHours: 2.0,
      });
      result.current.addTopic({
        subjectId: 'paper3',
        chapterId: 'paper3-custom',
        chapterName: 'Custom Math Drills',
        title: 'Advanced Calculus Drills',
        status: 'completed',
        estimatedMinutes: 60,
        estimatedHours: 1.0,
      });
    });

    expect(result.current.topics).toHaveLength(101);

    act(() => {
      result.current.resetToDefaultSyllabus({ preserveCustomTopics: true });
    });

    // 99 blueprint topics + 2 custom topics = 101 topics
    expect(result.current.topics).toHaveLength(101);

    // Default topics reset to pending
    const defaultTopics = result.current.topics.filter((t) => !t.isCustom);
    expect(defaultTopics).toHaveLength(99);
    for (const t of defaultTopics) {
      expect(t.status).toBe('pending');
    }

    // Custom topics preserved
    const customTopics = result.current.topics.filter((t) => t.isCustom);
    expect(customTopics).toHaveLength(2);
    expect(customTopics.find((t) => t.title === 'Custom Law Case Studies')?.status).toBe('in_progress');
    expect(customTopics.find((t) => t.title === 'Advanced Calculus Drills')?.status).toBe('completed');
  });

  it('selectively preserves tests and revisions while resetting topics', () => {
    const { result } = renderHook(() => useData(), { wrapper });

    act(() => {
      result.current.updateTopicStatus(result.current.topics[0].id, 'completed');
      result.current.addTest({
        title: 'Diagnostic Test Preserved',
        subjectId: 'paper4',
        testType: 'chapter',
        dateAttempted: '2026-08-28',
        marksObtained: 90,
        totalMarks: 100,
      });
    });

    expect(result.current.revisions.length).toBeGreaterThan(0);
    expect(result.current.tests).toHaveLength(1);

    act(() => {
      result.current.resetToDefaultSyllabus({
        preserveTests: true,
        preserveRevisions: true,
        preserveSettings: true,
      });
    });

    expect(result.current.topics).toHaveLength(99);
    expect(result.current.metrics.completedTopics).toBe(0);
    expect(result.current.tests).toHaveLength(1);
    expect(result.current.tests[0].title).toBe('Diagnostic Test Preserved');
    expect(result.current.revisions.length).toBeGreaterThan(0);
  });
});
