import { describe, it, expect, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { DataProvider, useData } from '@/context/DataContext';
import { TestsView } from '@/components/tests/TestsView';

const SeedMockSeries = () => {
  const { addTest } = useData();

  return (
    <div>
      <button
        onClick={() => {
          addTest({
            title: 'Mock 1 - ACC',
            subjectId: 'paper1',
            testType: 'mock',
            dateAttempted: '2026-08-20',
            marksObtained: 70,
            totalMarks: 100,
          });
          addTest({
            title: 'Mock 1 - BLAW',
            subjectId: 'paper2',
            testType: 'mock',
            dateAttempted: '2026-08-21',
            marksObtained: 65,
            totalMarks: 100,
          });
          addTest({
            title: 'Mock 1 - QA',
            subjectId: 'paper3',
            testType: 'mock',
            dateAttempted: '2026-08-22',
            marksObtained: 60,
            totalMarks: 100,
          });
          addTest({
            title: 'Mock 1 - BECO',
            subjectId: 'paper4',
            testType: 'mock',
            dateAttempted: '2026-08-23',
            marksObtained: 75,
            totalMarks: 100,
          });
        }}
      >
        Load Full Mock
      </button>
      <TestsView />
    </div>
  );
};

describe('Tier 3 - Combination 4: 4-Paper Mock Series -> ICAI Qualification Banner', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders passing qualification banner when candidate clears all 4 papers with >= 50% aggregate', () => {
    render(
      <DataProvider>
        <SeedMockSeries />
      </DataProvider>
    );

    const loadBtn = screen.getByText('Load Full Mock');
    fireEvent.click(loadBtn);

    expect(screen.getByText(/PASSED \(ICAI Qualified\)/i)).toBeInTheDocument();
    expect(screen.getByText(/270 \/ 400/i)).toBeInTheDocument();
  });
});
