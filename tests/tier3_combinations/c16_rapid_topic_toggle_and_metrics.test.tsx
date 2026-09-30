import { describe, it, expect, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { DataProvider, useData } from '@/context/DataContext';

const MultiTopicMetricsHarness = () => {
  const { topics, updateTopicStatus, metrics } = useData();

  return (
    <div>
      <div data-testid="completedCount">{metrics.completedTopics}</div>
      <div data-testid="pct">{metrics.overallProgressPercentage}</div>
      <button
        onClick={() => {
          topics.slice(0, 10).forEach((t) => {
            updateTopicStatus(t.id, 'completed');
          });
        }}
      >
        Complete 10 Topics
      </button>
    </div>
  );
};

describe('Tier 3 - Combination 16: Bulk Rapid Topic Mutations -> Overall Progress Metrics', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('accurately updates completed topics count and progress percentage on multiple completions', () => {
    render(
      <DataProvider>
        <MultiTopicMetricsHarness />
      </DataProvider>
    );

    expect(screen.getByTestId('completedCount').textContent).toBe('0');
    expect(screen.getByTestId('pct').textContent).toBe('0');

    fireEvent.click(screen.getByText('Complete 10 Topics'));

    expect(screen.getByTestId('completedCount').textContent).toBe('10');
    expect(Number(screen.getByTestId('pct').textContent)).toBeGreaterThan(0);
  });
});
