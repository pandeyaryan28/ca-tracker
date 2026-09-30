import { describe, it, expect, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { DataProvider, useData } from '@/context/DataContext';

const RevisionFlowHarness = () => {
  const { revisions, addRevision, advanceRevisionCycle } = useData();
  const current = revisions[0];

  return (
    <div>
      <div data-testid="cycle">{current ? current.cycle : 0}</div>
      <div data-testid="targetDate">{current ? current.nextTargetDate : 'none'}</div>
      <button
        onClick={() =>
          addRevision({
            topicId: 'top-1',
            topicTitle: 'Topic 1',
            chapterId: 'ch-1',
            chapterName: 'Chapter 1',
            subjectId: 'paper1',
            cycle: 1,
            lastRevisedDate: '2026-09-01',
            nextTargetDate: '2026-09-04',
            confidence: 'medium',
          })
        }
      >
        Start R1
      </button>
      <button onClick={() => advanceRevisionCycle('top-1', 'high')}>
        Advance With High Confidence
      </button>
    </div>
  );
};

describe('Tier 3 - Combination 7: Multi-Stage Revision Advance Cycle (R1 -> R2 -> R3+)', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('advances revision cycle from R1 to R2 and recalculates future target date with confidence multiplier', () => {
    render(
      <DataProvider>
        <RevisionFlowHarness />
      </DataProvider>
    );

    fireEvent.click(screen.getByText('Start R1'));
    expect(screen.getByTestId('cycle').textContent).toBe('1');

    fireEvent.click(screen.getByText('Advance With High Confidence'));
    expect(screen.getByTestId('cycle').textContent).toBe('2');
  });
});
