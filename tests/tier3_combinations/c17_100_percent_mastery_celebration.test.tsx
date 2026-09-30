import { describe, it, expect, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { DataProvider, useData } from '@/context/DataContext';

const MasteryHarness = () => {
  const { topics, updateTopicStatus, metrics } = useData();
  const p1Topics = topics.filter((t) => t.subjectId === 'paper1');

  return (
    <div>
      <div data-testid="p1Pct">{metrics.subjectProgress.paper1.percentage}</div>
      <div data-testid="isPassing">{metrics.subjectProgress.paper1.isPassingProjected ? 'yes' : 'no'}</div>
      <button
        onClick={() => {
          p1Topics.forEach((t) => {
            updateTopicStatus(t.id, 'completed');
          });
        }}
      >
        Master Paper 1
      </button>
    </div>
  );
};

describe('Tier 3 - Combination 17: 100% Subject Mastery -> Passing Projection', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('reflects 100% completion on Paper 1 and updates projected passing status', () => {
    render(
      <DataProvider>
        <MasteryHarness />
      </DataProvider>
    );

    expect(screen.getByTestId('p1Pct').textContent).toBe('0');
    expect(screen.getByTestId('isPassing').textContent).toBe('no');

    fireEvent.click(screen.getByText('Master Paper 1'));

    expect(screen.getByTestId('p1Pct').textContent).toBe('100');
    expect(screen.getByTestId('isPassing').textContent).toBe('yes');
  });
});
