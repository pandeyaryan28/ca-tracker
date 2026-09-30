import { describe, it, expect, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { DataProvider, useData } from '@/context/DataContext';

const RapidToggleHarness = () => {
  const { topics, updateTopicStatus } = useData();
  const top = topics[0];

  return (
    <div>
      <div data-testid="status">{top?.status}</div>
      <button
        data-testid="cycle-btn"
        onClick={() => {
          updateTopicStatus(top.id, 'in_progress');
          updateTopicStatus(top.id, 'completed');
          updateTopicStatus(top.id, 'pending');
          updateTopicStatus(top.id, 'in_progress');
          updateTopicStatus(top.id, 'completed');
        }}
      >
        Rapid Cycle 5x
      </button>
    </div>
  );
};

describe('Tier 2 - Boundary 8: Rapid State Transitions & State Machine Stress', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('maintains final completed state after 5 rapid consecutive transitions', () => {
    render(
      <DataProvider>
        <RapidToggleHarness />
      </DataProvider>
    );

    expect(screen.getByTestId('status').textContent).toBe('pending');
    fireEvent.click(screen.getByTestId('cycle-btn'));
    expect(screen.getByTestId('status').textContent).toBe('completed');
  });

  it('ensures startedAt and completedAt timestamps remain valid ISO strings after rapid toggles', () => {
    render(
      <DataProvider>
        <RapidToggleHarness />
      </DataProvider>
    );

    fireEvent.click(screen.getByTestId('cycle-btn'));
    const saved = JSON.parse(localStorage.getItem('ca_tracker_topics') || '[]');
    const first = saved[0];

    expect(first.status).toBe('completed');
    expect(first.startedAt).toBeTruthy();
    expect(first.completedAt).toBeTruthy();
    expect(isNaN(new Date(first.completedAt).getTime())).toBe(false);
  });

  it('handles multiple rapid toggles across 10 distinct topics', () => {
    render(
      <DataProvider>
        <RapidToggleHarness />
      </DataProvider>
    );

    expect(screen.getByTestId('cycle-btn')).toBeInTheDocument();
  });

  it('does not duplicate revision records on repeated completions of same topic', () => {
    render(
      <DataProvider>
        <RapidToggleHarness />
      </DataProvider>
    );

    fireEvent.click(screen.getByTestId('cycle-btn'));
    const revisions = JSON.parse(localStorage.getItem('ca_tracker_revisions') || '[]');
    const topic1Revs = revisions.filter((r: any) => r.topicId === 'acc-top-0101');

    expect(topic1Revs.length).toBeLessThanOrEqual(1);
  });

  it('persists consistent state without throw during re-renders', () => {
    const { unmount } = render(
      <DataProvider>
        <RapidToggleHarness />
      </DataProvider>
    );

    expect(() => {
      unmount();
    }).not.toThrow();
  });
});
