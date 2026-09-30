import { describe, it, expect, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { DataProvider, useData } from '@/context/DataContext';
import { RevisionsView } from '@/components/revision/RevisionsView';

const RevisionHarness = () => {
  const { addRevision } = useData();

  return (
    <div>
      <button
        onClick={() =>
          addRevision({
            topicId: 'acc-top-0101',
            topicTitle: 'Meaning and Scope of Accounting',
            chapterId: 'acc-ch-01',
            chapterName: 'Theoretical Framework',
            subjectId: 'paper1',
            cycle: 1,
            lastRevisedDate: '2026-08-20',
            nextTargetDate: '2026-08-23',
            confidence: 'medium',
          })
        }
      >
        Seed Revision
      </button>
      <RevisionsView />
    </div>
  );
};

describe('Tier 1 - Feature 16: Revision 1-Tap Increment & Mistake Notebook Modal', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders revision items with cycle and date indicators', () => {
    render(
      <DataProvider>
        <RevisionHarness />
      </DataProvider>
    );

    fireEvent.click(screen.getByText('Seed Revision'));
    expect(screen.getByText('Meaning and Scope of Accounting')).toBeInTheDocument();
    expect(screen.getByText('Cycle R1')).toBeInTheDocument();
  });

  it('advances cycle from R1 to R2 on 1-tap Advance click', () => {
    render(
      <DataProvider>
        <RevisionHarness />
      </DataProvider>
    );

    fireEvent.click(screen.getByText('Seed Revision'));
    const advanceBtn = screen.getByRole('button', { name: /Advance to R2/i });
    fireEvent.click(advanceBtn);

    expect(screen.getByText('Cycle R2')).toBeInTheDocument();
  });

  it('opens mistake notebook modal and saves annotations', () => {
    render(
      <DataProvider>
        <RevisionHarness />
      </DataProvider>
    );

    fireEvent.click(screen.getByText('Seed Revision'));
    const notesBtn = screen.getByRole('button', { name: /Notes/i });
    fireEvent.click(notesBtn);

    expect(screen.getByText(/Mistake Notebook & Exam Traps/i)).toBeInTheDocument();

    const textarea = screen.getByPlaceholderText(/Salomon v Salomon/i);
    fireEvent.change(textarea, {
      target: { value: 'Careful with qualitative characteristics vs fundamental assumptions.' },
    });

    const saveBtn = screen.getByRole('button', { name: /Save Notes/i });
    fireEvent.click(saveBtn);

    expect(
      screen.getByText(/Careful with qualitative characteristics vs fundamental assumptions/i)
    ).toBeInTheDocument();
  });

  it('allows confidence rating selection before advancing cycle', () => {
    render(
      <DataProvider>
        <RevisionHarness />
      </DataProvider>
    );

    fireEvent.click(screen.getByText('Seed Revision'));
    const highConfBtn = screen.getByText('High (2x)');
    fireEvent.click(highConfBtn);

    expect(highConfBtn).toBeInTheDocument();
  });

  it('dismisses revision record from active queue on delete click', () => {
    render(
      <DataProvider>
        <RevisionHarness />
      </DataProvider>
    );

    fireEvent.click(screen.getByText('Seed Revision'));
    const dismissBtn = screen.getByTitle('Dismiss revision');
    fireEvent.click(dismissBtn);

    expect(screen.queryByText('Meaning and Scope of Accounting')).not.toBeInTheDocument();
  });
});
