import { describe, it, expect, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { DataProvider, useData } from '@/context/DataContext';
import { ChecklistView } from '@/components/checklist/ChecklistView';
import { RevisionsView } from '@/components/revision/RevisionsView';

const SpacedJourneyHarness = () => {
  const [activeTab, setActiveTab] = React.useState<'checklist' | 'revisions'>('checklist');

  return (
    <div>
      <button onClick={() => setActiveTab('checklist')}>To Checklist</button>
      <button onClick={() => setActiveTab('revisions')}>To Revisions</button>
      {activeTab === 'checklist' && <ChecklistView />}
      {activeTab === 'revisions' && <RevisionsView />}
    </div>
  );
};

describe('Tier 4 - Scenario 2: 30-Day Spaced Repetition Lifecycle (R1 -> R2 -> R3+)', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('completes topic in checklist, advances through R1 with notes, then advances to R2', () => {
    render(
      <DataProvider>
        <SpacedJourneyHarness />
      </DataProvider>
    );

    // 1. In Checklist: expand chapter to reveal topics, then complete first topic
    fireEvent.click(screen.getByText('Expand All'));
    const firstStatusBtn = screen.getAllByTitle(/Status:/i)[0];
    // pending -> in_progress
    fireEvent.click(firstStatusBtn);
    // in_progress -> completed
    fireEvent.click(firstStatusBtn);

    // 2. Navigate to Revisions View
    fireEvent.click(screen.getByText('To Revisions'));

    // R1 revision auto-created
    expect(screen.getByText('Cycle R1')).toBeInTheDocument();

    // 3. Open Mistake Notebook
    const notesBtn = screen.getByRole('button', { name: /Notes/i });
    fireEvent.click(notesBtn);

    const textarea = screen.getByPlaceholderText(/Salomon v Salomon/i);
    fireEvent.change(textarea, { target: { value: 'Revise section 2(d) exception notes' } });

    const saveNotesBtn = screen.getByRole('button', { name: /Save Notes/i });
    fireEvent.click(saveNotesBtn);

    // 4. Advance to R2
    const advanceBtn = screen.getByRole('button', { name: /Advance to R2/i });
    fireEvent.click(advanceBtn);

    expect(screen.getByText('Cycle R2')).toBeInTheDocument();
    expect(screen.getByText(/Revise section 2\(d\) exception notes/i)).toBeInTheDocument();
  });
});
