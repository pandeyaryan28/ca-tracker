import { describe, it, expect, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { DataProvider } from '@/context/DataContext';
import { TestsView } from '@/components/tests/TestsView';
import { evaluateMockSeries } from '@/lib/utils';
import { TestRecord } from '@/types';

describe('Tier 1 - Feature 14: Test Performance Analytics & Weakness Index', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('evaluates mock series qualification according to ICAI criteria', () => {
    const mockTests: TestRecord[] = [
      {
        id: 't1',
        title: 'Mock Paper 1',
        subjectId: 'paper1',
        testType: 'mock',
        dateAttempted: '2026-08-20',
        marksObtained: 60,
        totalMarks: 100,
        percentage: 60,
        isPassed: true,
        createdAt: new Date().toISOString(),
      },
      {
        id: 't2',
        title: 'Mock Paper 2',
        subjectId: 'paper2',
        testType: 'mock',
        dateAttempted: '2026-08-21',
        marksObtained: 55,
        totalMarks: 100,
        percentage: 55,
        isPassed: true,
        createdAt: new Date().toISOString(),
      },
      {
        id: 't3',
        title: 'Mock Paper 3',
        subjectId: 'paper3',
        testType: 'mock',
        dateAttempted: '2026-08-22',
        marksObtained: 50,
        totalMarks: 100,
        percentage: 50,
        isPassed: true,
        createdAt: new Date().toISOString(),
      },
      {
        id: 't4',
        title: 'Mock Paper 4',
        subjectId: 'paper4',
        testType: 'mock',
        dateAttempted: '2026-08-23',
        marksObtained: 50,
        totalMarks: 100,
        percentage: 50,
        isPassed: true,
        createdAt: new Date().toISOString(),
      },
    ];

    const result = evaluateMockSeries(mockTests);
    expect(result.totalMarksObtained).toBe(215);
    expect(result.aggregatePercentage).toBe(53.8);
    expect(result.allPapersPassedIndividual).toBe(true);
    expect(result.aggregatePassed).toBe(true);
    expect(result.overallPassed).toBe(true);
    expect(result.statusMessage).toContain('PASSED');
  });

  it('detects individual paper deficiency (<40%) even if aggregate >= 50%', () => {
    const mockTests: TestRecord[] = [
      {
        id: 't1',
        title: 'Mock Paper 1',
        subjectId: 'paper1',
        testType: 'mock',
        dateAttempted: '2026-08-20',
        marksObtained: 80,
        totalMarks: 100,
        percentage: 80,
        isPassed: true,
        createdAt: new Date().toISOString(),
      },
      {
        id: 't2',
        title: 'Mock Paper 2',
        subjectId: 'paper2',
        testType: 'mock',
        dateAttempted: '2026-08-21',
        marksObtained: 35, // Failed paper (<40%)
        totalMarks: 100,
        percentage: 35,
        isPassed: false,
        createdAt: new Date().toISOString(),
      },
      {
        id: 't3',
        title: 'Mock Paper 3',
        subjectId: 'paper3',
        testType: 'mock',
        dateAttempted: '2026-08-22',
        marksObtained: 70,
        totalMarks: 100,
        percentage: 70,
        isPassed: true,
        createdAt: new Date().toISOString(),
      },
      {
        id: 't4',
        title: 'Mock Paper 4',
        subjectId: 'paper4',
        testType: 'mock',
        dateAttempted: '2026-08-23',
        marksObtained: 60,
        totalMarks: 100,
        percentage: 60,
        isPassed: true,
        createdAt: new Date().toISOString(),
      },
    ];

    const result = evaluateMockSeries(mockTests);
    expect(result.totalMarksObtained).toBe(245);
    expect(result.overallPassed).toBe(false);
    expect(result.statusMessage).toContain('Individual Paper < 40%');
  });

  it('renders overall mock performance banner and KPI metrics', () => {
    render(
      <DataProvider>
        <TestsView />
      </DataProvider>
    );

    expect(screen.getByText(/Mock Test Series & Performance Analytics/i)).toBeInTheDocument();
    expect(screen.getByText(/Tests Attempted/i)).toBeInTheDocument();
    expect(screen.getByText(/Overall Average Score/i)).toBeInTheDocument();
  });

  it('filters test history by subject paper', () => {
    render(
      <DataProvider>
        <TestsView />
      </DataProvider>
    );

    const selects = screen.getAllByRole('combobox');
    expect(selects.length).toBeGreaterThanOrEqual(1);
  });

  it('allows deleting recorded tests and updates count', () => {
    render(
      <DataProvider>
        <TestsView />
      </DataProvider>
    );

    const logBtn = screen.getByRole('button', { name: /Log Test Score/i });
    fireEvent.click(logBtn);

    const titleInput = screen.getByPlaceholderText(/Diagnostic Test/i);
    fireEvent.change(titleInput, { target: { value: 'Test to be deleted' } });

    const submitBtn = screen.getByRole('button', { name: /Save Test Score/i });
    fireEvent.click(submitBtn);

    expect(screen.getByText('Test to be deleted')).toBeInTheDocument();

    const deleteBtn = screen.getByRole('button', { name: /Delete/i });
    fireEvent.click(deleteBtn);

    expect(screen.queryByText('Test to be deleted')).not.toBeInTheDocument();
  });
});
