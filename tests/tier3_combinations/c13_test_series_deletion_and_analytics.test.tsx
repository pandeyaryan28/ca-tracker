import { describe, it, expect, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { DataProvider, useData } from '@/context/DataContext';

const TestDeletionAnalyticsHarness = () => {
  const { addTest, deleteTest, tests, metrics } = useData();

  return (
    <div>
      <div data-testid="count">{metrics.totalTestsLogged}</div>
      <div data-testid="avg">{metrics.recentTestsAveragePercentage}</div>
      <button
        onClick={() => {
          addTest({
            title: 'Test 1 - High',
            subjectId: 'paper1',
            testType: 'chapter',
            dateAttempted: '2026-08-20',
            marksObtained: 90,
            totalMarks: 100,
          });
          addTest({
            title: 'Test 2 - Low',
            subjectId: 'paper1',
            testType: 'chapter',
            dateAttempted: '2026-08-21',
            marksObtained: 30,
            totalMarks: 100,
          });
        }}
      >
        Seed 2 Tests
      </button>
      <button
        onClick={() => {
          const lowTest = tests.find((t) => t.marksObtained === 30);
          if (lowTest) deleteTest(lowTest.id);
        }}
      >
        Delete Low Test
      </button>
    </div>
  );
};

describe('Tier 3 - Combination 13: Test Series Deletion -> Live Average Score Recalculation', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('recalculates average score immediately upon deleting a test record', () => {
    render(
      <DataProvider>
        <TestDeletionAnalyticsHarness />
      </DataProvider>
    );

    fireEvent.click(screen.getByText('Seed 2 Tests'));
    expect(screen.getByTestId('count').textContent).toBe('2');
    expect(screen.getByTestId('avg').textContent).toBe('60'); // (90 + 30) / 2 = 60

    fireEvent.click(screen.getByText('Delete Low Test'));
    expect(screen.getByTestId('count').textContent).toBe('1');
    expect(screen.getByTestId('avg').textContent).toBe('90');
  });
});
