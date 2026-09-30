import { describe, it, expect, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { DataProvider, useData } from '@/context/DataContext';

const ResetPreservationHarness = () => {
  const { addTopic, addTest, addRevision, resetToDefaultSyllabus, topics, tests, revisions } = useData();

  return (
    <div>
      <div data-testid="topCount">{topics.length}</div>
      <div data-testid="testCount">{tests.length}</div>
      <div data-testid="revCount">{revisions.length}</div>
      <button
        onClick={() => {
          addTopic({
            title: 'Custom Topic Preserved',
            subjectId: 'paper1',
            chapterId: 'paper1-custom',
            chapterName: 'Custom Chapter',
            status: 'pending',
          });
          addTest({
            title: 'Diagnostic Test Preserved',
            subjectId: 'paper1',
            testType: 'chapter',
            dateAttempted: '2026-08-20',
            marksObtained: 80,
            totalMarks: 100,
          });
          addRevision({
            topicId: 'acc-top-0101',
            topicTitle: 'Topic 1',
            chapterId: 'acc-ch-01',
            chapterName: 'Ch 1',
            subjectId: 'paper1',
            cycle: 1,
            lastRevisedDate: '2026-08-20',
            nextTargetDate: '2026-08-23',
            confidence: 'medium',
          });
        }}
      >
        Seed Custom Data
      </button>
      <button
        onClick={() =>
          resetToDefaultSyllabus({
            preserveCustomTopics: true,
            preserveTests: true,
            preserveRevisions: true,
          })
        }
      >
        Reset With Preserves
      </button>
    </div>
  );
};

describe('Tier 3 - Combination 9: Syllabus Reset with Multi-Entity Preservation', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('preserves user custom topics, tests, and revisions while restoring standard blueprint', () => {
    render(
      <DataProvider>
        <ResetPreservationHarness />
      </DataProvider>
    );

    fireEvent.click(screen.getByText('Seed Custom Data'));
    expect(screen.getByTestId('topCount').textContent).toBe('100');
    expect(screen.getByTestId('testCount').textContent).toBe('1');
    expect(screen.getByTestId('revCount').textContent).toBe('1');

    fireEvent.click(screen.getByText('Reset With Preserves'));
    expect(screen.getByTestId('topCount').textContent).toBe('100');
    expect(screen.getByTestId('testCount').textContent).toBe('1');
    expect(screen.getByTestId('revCount').textContent).toBe('1');
  });
});
