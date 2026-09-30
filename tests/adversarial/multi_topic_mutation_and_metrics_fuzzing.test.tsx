import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { DataProvider, useData } from '@/context/DataContext';

const wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <DataProvider>{children}</DataProvider>
);

describe('Adversarial Stress Test: Multi-Topic Mutation & Metrics Fuzzing', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('completes all 99 topics and reaches exact 100% metrics across all papers', () => {
    const { result } = renderHook(() => useData(), { wrapper });

    act(() => {
      for (const topic of result.current.topics) {
        result.current.updateTopicStatus(topic.id, 'completed');
      }
    });

    expect(result.current.metrics.totalTopics).toBe(99);
    expect(result.current.metrics.completedTopics).toBe(99);
    expect(result.current.metrics.inProgressTopics).toBe(0);
    expect(result.current.metrics.pendingTopics).toBe(0);
    expect(result.current.metrics.overallProgressPercentage).toBe(100);
    expect(result.current.metrics.aggregatePassingLikelihood).toBe('On Track');

    // Check all 4 subject groups
    const { paper1, paper2, paper3, paper4 } = result.current.subjectGroups;
    expect(paper1.progressPercentage).toBe(100);
    expect(paper1.completedTopics).toBe(33);
    expect(paper2.progressPercentage).toBe(100);
    expect(paper2.completedTopics).toBe(20);
    expect(paper3.progressPercentage).toBe(100);
    expect(paper3.completedTopics).toBe(20);
    expect(paper4.progressPercentage).toBe(100);
    expect(paper4.completedTopics).toBe(26);

    // Sum of completed study hours should equal total estimated hours
    const totalBlueprintHours = result.current.topics.reduce((acc, t) => acc + (t.estimatedHours || 0), 0);
    expect(result.current.metrics.totalStudyHoursLogged).toBeCloseTo(totalBlueprintHours, 1);
  });

  it('reverts all topics back to pending and drops cleanly to 0%', () => {
    const { result } = renderHook(() => useData(), { wrapper });

    // 1. Complete all
    act(() => {
      for (const topic of result.current.topics) {
        result.current.updateTopicStatus(topic.id, 'completed');
      }
    });
    expect(result.current.metrics.overallProgressPercentage).toBe(100);

    // 2. Revert all to pending
    act(() => {
      for (const topic of result.current.topics) {
        result.current.updateTopicStatus(topic.id, 'pending');
      }
    });

    expect(result.current.metrics.completedTopics).toBe(0);
    expect(result.current.metrics.inProgressTopics).toBe(0);
    expect(result.current.metrics.pendingTopics).toBe(99);
    expect(result.current.metrics.overallProgressPercentage).toBe(0);
    expect(result.current.metrics.totalStudyHoursLogged).toBe(0);
    expect(result.current.metrics.aggregatePassingLikelihood).toBe('At Risk');
  });

  it('Monte Carlo Fuzzing: Executes 300 randomized state actions while maintaining all mathematical invariants', () => {
    const { result } = renderHook(() => useData(), { wrapper });
    const statuses: ('pending' | 'in_progress' | 'completed')[] = ['pending', 'in_progress', 'completed'];

    for (let step = 0; step < 300; step++) {
      const op = step % 5;
      
      act(() => {
        if (op === 0 || op === 1 || op === 2) {
          // Change topic status
          const topicIndex = (step * 7) % result.current.topics.length;
          const targetTopic = result.current.topics[topicIndex];
          if (targetTopic) {
            result.current.updateTopicStatus(targetTopic.id, statuses[step % 3]);
          }
        } else if (op === 3) {
          // Add a custom topic
          result.current.addTopic({
            subjectId: 'paper1',
            chapterId: 'paper1-ch1',
            chapterName: 'Test Chapter',
            title: `Fuzzed Topic ${step}`,
            status: 'pending',
            estimatedMinutes: 30,
            estimatedHours: 0.5,
          });
        } else if (op === 4) {
          // Add a test
          result.current.addTest({
            title: `Fuzzed Test ${step}`,
            subjectId: 'paper3',
            testType: 'chapter',
            dateAttempted: '2026-08-28',
            marksObtained: (step * 13) % 100,
            totalMarks: 100,
          });
        }
      });

      // Assert Invariants at each iteration
      const topics = result.current.topics;
      const completed = topics.filter((t) => t.status === 'completed').length;
      const inProg = topics.filter((t) => t.status === 'in_progress').length;
      const pending = topics.filter((t) => t.status === 'pending').length;

      expect(topics.length).toBe(completed + inProg + pending);
      expect(result.current.metrics.totalTopics).toBe(topics.length);
      expect(result.current.metrics.completedTopics).toBe(completed);
      expect(result.current.metrics.inProgressTopics).toBe(inProg);
      expect(result.current.metrics.pendingTopics).toBe(pending);
      expect(result.current.metrics.overallProgressPercentage).toBeGreaterThanOrEqual(0);
      expect(result.current.metrics.overallProgressPercentage).toBeLessThanOrEqual(100);
      expect(Number.isNaN(result.current.metrics.overallProgressPercentage)).toBe(false);
      expect(Number.isNaN(result.current.metrics.totalStudyHoursLogged)).toBe(false);
    }
  });
});
