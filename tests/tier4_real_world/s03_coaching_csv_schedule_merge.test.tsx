import { describe, it, expect, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { DataProvider } from '@/context/DataContext';
import { IngestionView } from '@/components/ingestion/IngestionView';
import { ChecklistView } from '@/components/checklist/ChecklistView';

const CoachingMergeHarness = () => {
  const [tab, setTab] = React.useState<'ingestion' | 'checklist'>('ingestion');

  return (
    <div>
      <button onClick={() => setTab('ingestion')}>To Ingest</button>
      <button onClick={() => setTab('checklist')}>To Checklist</button>
      {tab === 'ingestion' && <IngestionView />}
      {tab === 'checklist' && <ChecklistView />}
    </div>
  );
};

describe('Tier 4 - Scenario 3: Coaching Class Timetable CSV Ingestion & Merge', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('ingests batch coaching CSV timetable with Merge mode and verifies updated schedule in checklist', () => {
    render(
      <DataProvider>
        <CoachingMergeHarness />
      </DataProvider>
    );

    // 1. Select CSV Format
    const csvBtn = screen.getByText('CSV');
    fireEvent.click(csvBtn);

    // 2. Paste Coaching Timetable CSV
    const csvContent =
      'TopicID,SubjectID,ChapterName,Title,Status,EstimatedHours,TargetDate\n' +
      'coaching-acc-01,paper1,"Special Accounts","Coaching Class Lecture 1 - Consignment",pending,2.5,2026-09-10\n' +
      'coaching-law-01,paper2,"Special Law","Coaching Class Lecture 2 - Partnership",pending,2.0,2026-09-12\n';

    const textarea = screen.getByPlaceholderText(/Paste exported CSV payload/i);
    fireEvent.change(textarea, { target: { value: csvContent } });

    // 3. Click Process Ingestion
    const submitBtn = screen.getByRole('button', { name: /Process Ingestion/i });
    fireEvent.click(submitBtn);

    expect(screen.getByText(/Successfully ingested 2 topics from CSV/i)).toBeInTheDocument();

    // 4. Navigate to Checklist
    fireEvent.click(screen.getByText('To Checklist'));
    fireEvent.click(screen.getByText('Expand All'));
    expect(screen.getByText('Coaching Class Lecture 1 - Consignment')).toBeInTheDocument();
  });
});
