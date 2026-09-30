import { describe, it, expect, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { DataProvider, useData } from '@/context/DataContext';

const CompleteAndScheduleHarness = () => {
  const { topics, updateTopicStatus, revisions, actionPlan } = useData();
  const target = topics[0];

  return (
    <div>
      <div data-testid="status">{target?.status}</div>
      <div data-testid="revCount">{revisions.length}</div>
      <div data-testid="actionCount">{actionPlan.length}</div>
      <button onClick={() => updateTopicStatus(target.id, 'completed')}>
        Complete Topic
      </button>
    </div>
  );
};

describe('Tier 3 - Combination 2: Topic Completion -> Auto Spaced Revision -> Action Plan', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('automatically schedules R1 revision upon topic completion and includes it in state', () => {
    render(
      <DataProvider>
        <CompleteAndScheduleHarness />
      </DataProvider>
    );

    expect(screen.getByTestId('status').textContent).toBe('pending');
    expect(screen.getByTestId('revCount').textContent).toBe('0');

    fireEvent.click(screen.getByText('Complete Topic'));

    expect(screen.getByTestId('status').textContent).toBe('completed');
    expect(Number(screen.getByTestId('revCount').textContent)).toBeGreaterThanOrEqual(1);
  });
});
