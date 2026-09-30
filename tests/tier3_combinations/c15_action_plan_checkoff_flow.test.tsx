import { describe, it, expect, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { DataProvider, useData } from '@/context/DataContext';
import { getTodayDateString } from '@/lib/utils';

const ActionPlanCheckoffHarness = () => {
  const { topics, updateTopic, updateTopicStatus } = useData();
  const today = getTodayDateString();
  const first = topics[0];

  return (
    <div>
      <div data-testid="status">{first?.status}</div>
      <button onClick={() => updateTopic(first.id, { targetDate: today })}>
        Schedule For Today
      </button>
      <button onClick={() => updateTopicStatus(first.id, 'completed')}>
        1-Tap Checkoff
      </button>
    </div>
  );
};

describe('Tier 3 - Combination 15: 1-Tap Action Plan Check-Off -> Topic Status Synchronization', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('completes scheduled lesson item via 1-tap checkoff and updates topic status', () => {
    render(
      <DataProvider>
        <ActionPlanCheckoffHarness />
      </DataProvider>
    );

    fireEvent.click(screen.getByText('Schedule For Today'));
    expect(screen.getByTestId('status').textContent).toBe('pending');

    fireEvent.click(screen.getByText('1-Tap Checkoff'));
    expect(screen.getByTestId('status').textContent).toBe('completed');
  });
});
