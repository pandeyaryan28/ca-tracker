import { describe, it, expect, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { DataProvider } from '@/context/DataContext';
import { IngestionView } from '@/components/ingestion/IngestionView';

describe('Tier 1 - Feature 12: Schedule Ingestion & Export Engine (JSON/CSV)', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders export buttons for JSON, CSV, and downloadable template', () => {
    render(
      <DataProvider>
        <IngestionView />
      </DataProvider>
    );

    expect(screen.getByRole('button', { name: /Export JSON/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Export CSV/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Sample CSV Template/i })).toBeInTheDocument();
  });

  it('provides conflict resolution options (Merge, Overwrite, Skip)', () => {
    render(
      <DataProvider>
        <IngestionView />
      </DataProvider>
    );

    expect(screen.getByLabelText(/merge/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/overwrite/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/skip/i)).toBeInTheDocument();
  });

  it('imports valid JSON payload into state', () => {
    render(
      <DataProvider>
        <IngestionView />
      </DataProvider>
    );

    const textarea = screen.getByPlaceholderText(/Paste exported/i);
    const validJson = JSON.stringify({
      topics: [
        {
          id: 'imported-top-1',
          subjectId: 'paper1',
          chapterId: 'acc-ch-01',
          chapterName: 'Accounting',
          title: 'Imported Topic 1',
          status: 'pending',
          estimatedHours: 2.0,
          estimatedMinutes: 120,
          order: 1,
        },
      ],
    });

    fireEvent.change(textarea, { target: { value: validJson } });
    const submitBtn = screen.getByRole('button', { name: /Process Ingestion/i });
    fireEvent.click(submitBtn);

    expect(screen.getByText(/JSON data imported successfully/i)).toBeInTheDocument();
  });

  it('imports valid CSV payload into state', () => {
    render(
      <DataProvider>
        <IngestionView />
      </DataProvider>
    );

    const csvFormatBtn = screen.getByText('CSV');
    fireEvent.click(csvFormatBtn);

    const textarea = screen.getByPlaceholderText(/Paste exported/i);
    const csvContent =
      'TopicID,SubjectID,ChapterName,Title,Status,EstimatedHours,TargetDate\n' +
      'csv-top-99,paper2,"Indian Contract Act","Consideration Essentials",pending,1.5,2026-10-01\n';

    fireEvent.change(textarea, { target: { value: csvContent } });
    const submitBtn = screen.getByRole('button', { name: /Process Ingestion/i });
    fireEvent.click(submitBtn);

    expect(screen.getByText(/Successfully ingested 1 topics from CSV/i)).toBeInTheDocument();
  });

  it('opens confirmation modal before resetting syllabus blueprint', () => {
    render(
      <DataProvider>
        <IngestionView />
      </DataProvider>
    );

    const resetBtn = screen.getByRole('button', { name: /Reset to ICAI Blueprint/i });
    fireEvent.click(resetBtn);

    expect(screen.getByText(/Confirm ICAI Syllabus Reset/i)).toBeInTheDocument();
  });
});
