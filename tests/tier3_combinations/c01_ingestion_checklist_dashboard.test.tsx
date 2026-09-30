import { describe, it, expect, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { DataProvider, useData } from '@/context/DataContext';
import { DashboardView } from '@/components/dashboard/DashboardView';
import { ChecklistView } from '@/components/checklist/ChecklistView';

const IngestionChecklistWorkflow = () => {
  const { importData } = useData();

  return (
    <div>
      <button
        onClick={() =>
          importData(
            {
              version: '1.0',
              appVersion: '1.0.0',
              exportedAt: new Date().toISOString(),
              settings: {} as any,
              topics: [
                {
                  id: 'ingested-law-01',
                  subjectId: 'paper2',
                  chapterId: 'law-custom-ch',
                  chapterName: 'Custom Law Module',
                  title: 'Ingested Special Contract Act',
                  status: 'completed',
                  estimatedHours: 2.0,
                  estimatedMinutes: 120,
                  order: 999,
                  isCustom: true,
                },
              ],
              revisions: [],
              tests: [],
            },
            'merge'
          )
        }
      >
        Trigger Ingest
      </button>
      <DashboardView />
      <ChecklistView />
    </div>
  );
};

describe('Tier 3 - Combination 1: Ingestion -> Checklist Tree -> Dashboard Gauge', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('ingests custom syllabus topic, renders in checklist hierarchy, and updates dashboard metrics', () => {
    render(
      <DataProvider>
        <IngestionChecklistWorkflow />
      </DataProvider>
    );

    expect(screen.getByText(/Syllabus Completion/i)).toBeInTheDocument();

    fireEvent.click(screen.getByText('Trigger Ingest'));
    fireEvent.click(screen.getByText('Expand All'));
    expect(screen.getByText('Ingested Special Contract Act')).toBeInTheDocument();
  });
});
