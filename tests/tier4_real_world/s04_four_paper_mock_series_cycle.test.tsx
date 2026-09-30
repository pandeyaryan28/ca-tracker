import { describe, it, expect, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { DataProvider, useData } from '@/context/DataContext';
import { TestsView } from '@/components/tests/TestsView';

const MockSeriesWorkflow = () => {
  const { addTest } = useData();

  return (
    <div>
      <button
        onClick={() => {
          // Attempt 1: Failed Law (35%)
          addTest({ title: 'Mock 1 ACC', subjectId: 'paper1', testType: 'mock', dateAttempted: '2026-08-20', marksObtained: 70, totalMarks: 100 });
          addTest({ title: 'Mock 1 BLAW Initial', subjectId: 'paper2', testType: 'mock', dateAttempted: '2026-08-21', marksObtained: 35, totalMarks: 100, weakTopics: ['Consideration'] });
          addTest({ title: 'Mock 1 QA', subjectId: 'paper3', testType: 'mock', dateAttempted: '2026-08-22', marksObtained: 60, totalMarks: 100 });
          addTest({ title: 'Mock 1 BECO', subjectId: 'paper4', testType: 'mock', dateAttempted: '2026-08-23', marksObtained: 75, totalMarks: 100 });
        }}
      >
        Attempt 1 (Failed Law)
      </button>
      <button
        onClick={() => {
          // Attempt 2: Retake Law with 65%
          addTest({ title: 'Mock 1 BLAW Retake', subjectId: 'paper2', testType: 'mock', dateAttempted: '2026-08-28', marksObtained: 65, totalMarks: 100 });
        }}
      >
        Retake Law Passed
      </button>
      <TestsView />
    </div>
  );
};

describe('Tier 4 - Scenario 4: 4-Paper Mock Series Remediation & Retake Cycle', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('detects individual paper deficiency in Law, then transitions to ICAI Qualified after retake', () => {
    render(
      <DataProvider>
        <MockSeriesWorkflow />
      </DataProvider>
    );

    // 1. First Attempt: Law is 35% (<40%)
    fireEvent.click(screen.getByText('Attempt 1 (Failed Law)'));
    expect(screen.getByText(/Individual Paper < 40%/i)).toBeInTheDocument();
    expect(screen.getByText('Weak: Consideration')).toBeInTheDocument();

    // 2. Retake Attempt: Law is 65%
    fireEvent.click(screen.getByText('Retake Law Passed'));
    expect(screen.getByText(/PASSED \(ICAI Qualified\)/i)).toBeInTheDocument();
  });
});
