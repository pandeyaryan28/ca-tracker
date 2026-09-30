import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { DataProvider, useData } from '@/context/DataContext';

const wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <DataProvider>{children}</DataProvider>
);

describe('Adversarial Stress Test: Rapid Status Cycling & State Machine Invariants', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('preserves timestamp integrity across rapid cycle: pending -> in_progress -> completed -> pending -> in_progress', () => {
    const { result } = renderHook(() => useData(), { wrapper });
    const targetTopicId = result.current.topics[0].id;

    // Step 1: Initial state
    let topic = result.current.topics.find((t) => t.id === targetTopicId);
    expect(topic?.status).toBe('pending');
    expect(topic?.startedAt).toBeUndefined();
    expect(topic?.completedAt).toBeUndefined();

    // Step 2: in_progress
    act(() => {
      result.current.updateTopicStatus(targetTopicId, 'in_progress');
    });
    topic = result.current.topics.find((t) => t.id === targetTopicId);
    expect(topic?.status).toBe('in_progress');
    const firstStartedAt = topic?.startedAt;
    expect(firstStartedAt).toBeDefined();
    expect(topic?.completedAt).toBeUndefined();

    // Step 3: completed
    act(() => {
      result.current.updateTopicStatus(targetTopicId, 'completed');
    });
    topic = result.current.topics.find((t) => t.id === targetTopicId);
    expect(topic?.status).toBe('completed');
    expect(topic?.startedAt).toBe(firstStartedAt); // Preserves initial startedAt
    const firstCompletedAt = topic?.completedAt;
    expect(firstCompletedAt).toBeDefined();
    expect(new Date(firstStartedAt!).getTime()).toBeLessThanOrEqual(new Date(firstCompletedAt!).getTime());

    // Step 4: Revert to pending
    act(() => {
      result.current.updateTopicStatus(targetTopicId, 'pending');
    });
    topic = result.current.topics.find((t) => t.id === targetTopicId);
    expect(topic?.status).toBe('pending');
    expect(topic?.completedAt).toBeUndefined(); // Clears completedAt
    expect(topic?.startedAt).toBe(firstStartedAt); // Keeps study history startedAt

    // Step 5: Cycle back to in_progress
    act(() => {
      result.current.updateTopicStatus(targetTopicId, 'in_progress');
    });
    topic = result.current.topics.find((t) => t.id === targetTopicId);
    expect(topic?.status).toBe('in_progress');
    expect(topic?.startedAt).toBe(firstStartedAt);
    expect(topic?.completedAt).toBeUndefined();

    // Step 6: Cycle back to completed
    act(() => {
      result.current.updateTopicStatus(targetTopicId, 'completed');
    });
    topic = result.current.topics.find((t) => t.id === targetTopicId);
    expect(topic?.status).toBe('completed');
    expect(topic?.completedAt).toBeDefined();
    expect(new Date(topic!.startedAt!).getTime()).toBeLessThanOrEqual(new Date(topic!.completedAt!).getTime());
  });

  it('prevents duplicate revision entries across 100 consecutive completed/pending/completed flips', () => {
    const { result } = renderHook(() => useData(), { wrapper });
    const targetTopicId = result.current.topics[2].id;

    for (let i = 0; i < 100; i++) {
      act(() => {
        result.current.updateTopicStatus(targetTopicId, 'completed');
      });
      act(() => {
        result.current.updateTopicStatus(targetTopicId, 'pending');
      });
    }

    // Finally complete
    act(() => {
      result.current.updateTopicStatus(targetTopicId, 'completed');
    });

    const topicRevisions = result.current.revisions.filter((r) => r.topicId === targetTopicId);
    // There must be exactly 1 revision record for this topic, not 101 records
    expect(topicRevisions).toHaveLength(1);
    expect(topicRevisions[0].cycle).toBe(1);
  });

  it('correctly handles direct jump from pending to completed (auto-populating startedAt & completedAt)', () => {
    const { result } = renderHook(() => useData(), { wrapper });
    const targetTopicId = result.current.topics[10].id;

    act(() => {
      result.current.updateTopicStatus(targetTopicId, 'completed');
    });

    const topic = result.current.topics.find((t) => t.id === targetTopicId);
    expect(topic?.status).toBe('completed');
    expect(topic?.startedAt).toBeDefined();
    expect(topic?.completedAt).toBeDefined();
    expect(new Date(topic!.startedAt!).getTime()).toBeLessThanOrEqual(new Date(topic!.completedAt!).getTime());
  });

  it('executes 500 rapid random status flips across multiple topics without internal state desync', () => {
    const { result } = renderHook(() => useData(), { wrapper });
    const statuses: ('pending' | 'in_progress' | 'completed')[] = ['pending', 'in_progress', 'completed'];

    for (let i = 0; i < 500; i++) {
      const topicIndex = i % 20;
      const topicId = result.current.topics[topicIndex].id;
      const nextStatus = statuses[i % 3];

      act(() => {
        result.current.updateTopicStatus(topicId, nextStatus);
      });
    }

    // Verify mathematical invariants
    const completedCount = result.current.topics.filter((t) => t.status === 'completed').length;
    const inProgressCount = result.current.topics.filter((t) => t.status === 'in_progress').length;
    const pendingCount = result.current.topics.filter((t) => t.status === 'pending').length;

    expect(result.current.topics.length).toBe(99);
    expect(completedCount + inProgressCount + pendingCount).toBe(99);
    expect(result.current.metrics.completedTopics).toBe(completedCount);
    expect(result.current.metrics.inProgressTopics).toBe(inProgressCount);
    expect(result.current.metrics.pendingTopics).toBe(pendingCount);
  });
});
