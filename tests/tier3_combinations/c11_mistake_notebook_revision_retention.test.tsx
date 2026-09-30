import { describe, it, expect, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { DataProvider, useData } from '@/context/DataContext';

const MistakeRetentionHarness = () => {
  const { revisions, addRevision, advanceRevisionCycle, updateRevision } = useData();
  const current = revisions[0];

  return (
    <div>
      <div data-testid="cycle">{current ? current.cycle : 0}</div>
      <div data-testid="notes">{current ? current.mistakesNotes || 'none' : 'none'}</div>
      <button
        onClick={() =>
          addRevision({
            topicId: 'acc-top-0101',
            topicTitle: 'Topic With Mistake Notes',
            chapterId: 'acc-ch-01',
            chapterName: 'Ch 1',
            subjectId: 'paper1',
            cycle: 1,
            lastRevisedDate: '2026-08-20',
            nextTargetDate: '2026-08-23',
            confidence: 'medium',
            mistakesNotes: 'Remember rule in case law ABC',
          })
        }
      >
        Seed Revision
      </button>
      <button onClick={() => advanceRevisionCycle('acc-top-0101', 'high')}>
        Advance to R2
      </button>
    </div>
  );
};

describe('Tier 3 - Combination 11: Mistake Notebook Notes Retention Across Advance Cycles', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('retains mistake notes when advancing cycle from R1 to R2', () => {
    render(
      <DataProvider>
        <MistakeRetentionHarness />
      </DataProvider>
    );

    fireEvent.click(screen.getByText('Seed Revision'));
    expect(screen.getByTestId('notes').textContent).toBe('Remember rule in case law ABC');
    expect(screen.getByTestId('cycle').textContent).toBe('1');

    fireEvent.click(screen.getByText('Advance to R2'));
    expect(screen.getByTestId('cycle').textContent).toBe('2');
    expect(screen.getByTestId('notes').textContent).toBe('Remember rule in case law ABC');
  });
});
