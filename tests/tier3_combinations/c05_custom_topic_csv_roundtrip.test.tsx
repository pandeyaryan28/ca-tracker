import { describe, it, expect, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { DataProvider, useData } from '@/context/DataContext';

const RoundtripHarness = () => {
  const { addTopic, exportData, topics, resetToDefaultSyllabus } = useData();

  return (
    <div>
      <div data-testid="topicsCount">{topics.length}</div>
      <button
        onClick={() =>
          addTopic({
            title: 'Custom Partnership Topic',
            subjectId: 'paper1',
            chapterId: 'paper1-custom',
            chapterName: 'Extra Coaching',
            status: 'pending',
          })
        }
      >
        Add Custom
      </button>
      <button
        onClick={() => {
          const exported = exportData('csv');
          localStorage.setItem('temp_exported_csv', exported);
        }}
      >
        Export CSV
      </button>
      <button onClick={() => resetToDefaultSyllabus({ preserveCustomTopics: false })}>
        Hard Reset
      </button>
    </div>
  );
};

describe('Tier 3 - Combination 5: Custom Topic Creation -> CSV Export -> Reset Roundtrip', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('creates custom topic, exports CSV, resets syllabus and verifies export content contains custom topic', () => {
    render(
      <DataProvider>
        <RoundtripHarness />
      </DataProvider>
    );

    expect(screen.getByTestId('topicsCount').textContent).toBe('99');

    fireEvent.click(screen.getByText('Add Custom'));
    expect(screen.getByTestId('topicsCount').textContent).toBe('100');

    fireEvent.click(screen.getByText('Export CSV'));
    const csvContent = localStorage.getItem('temp_exported_csv') || '';
    expect(csvContent).toContain('Custom Partnership Topic');

    fireEvent.click(screen.getByText('Hard Reset'));
    expect(screen.getByTestId('topicsCount').textContent).toBe('99');
  });
});
