import { describe, it, expect, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { DataProvider } from '@/context/DataContext';
import { TestsView } from '@/components/tests/TestsView';

describe('Tier 1 - Feature 13: Test Series & Score Logger Form', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('opens log test modal on Log Test Score click', () => {
    render(
      <DataProvider>
        <TestsView />
      </DataProvider>
    );

    const logBtn = screen.getByRole('button', { name: /Log Test Score/i });
    fireEvent.click(logBtn);

    expect(screen.getByText(/Log Test Score & Analysis/i)).toBeInTheDocument();
  });

  it('calculates percentage accurately: (marks / total) * 100', () => {
    render(
      <DataProvider>
        <TestsView />
      </DataProvider>
    );

    const logBtn = screen.getByRole('button', { name: /Log Test Score/i });
    fireEvent.click(logBtn);

    const titleInput = screen.getByPlaceholderText(/Diagnostic Test/i);
    fireEvent.change(titleInput, { target: { value: 'Unit Test 1 - Accounting' } });

    const submitBtn = screen.getByRole('button', { name: /Save Test Score/i });
    fireEvent.click(submitBtn);

    expect(screen.getByText('Unit Test 1 - Accounting')).toBeInTheDocument();
    expect(screen.getAllByText(/75%/).length).toBeGreaterThan(0);
  });

  it('flags test as Passed when score >= 40.0%', () => {
    render(
      <DataProvider>
        <TestsView />
      </DataProvider>
    );

    const logBtn = screen.getByRole('button', { name: /Log Test Score/i });
    fireEvent.click(logBtn);

    const titleInput = screen.getByPlaceholderText(/Diagnostic Test/i);
    fireEvent.change(titleInput, { target: { value: 'Passing Mock Test' } });

    const marksInput = screen.getByDisplayValue('75');
    fireEvent.change(marksInput, { target: { value: '55' } });

    const submitBtn = screen.getByRole('button', { name: /Save Test Score/i });
    fireEvent.click(submitBtn);

    expect(screen.getByText(/55% \(Passed\)/i)).toBeInTheDocument();
  });

  it('flags test as Failed when score < 40.0%', () => {
    render(
      <DataProvider>
        <TestsView />
      </DataProvider>
    );

    const logBtn = screen.getByRole('button', { name: /Log Test Score/i });
    fireEvent.click(logBtn);

    const titleInput = screen.getByPlaceholderText(/Diagnostic Test/i);
    fireEvent.change(titleInput, { target: { value: 'Failed Paper Test' } });

    const marksInput = screen.getByDisplayValue('75');
    fireEvent.change(marksInput, { target: { value: '35' } });

    const submitBtn = screen.getByRole('button', { name: /Save Test Score/i });
    fireEvent.click(submitBtn);

    expect(screen.getByText(/35% \(Failed \(<40%\)\)/i)).toBeInTheDocument();
  });

  it('allows logging weak topic tags with test submission', () => {
    render(
      <DataProvider>
        <TestsView />
      </DataProvider>
    );

    const logBtn = screen.getByRole('button', { name: /Log Test Score/i });
    fireEvent.click(logBtn);

    const titleInput = screen.getByPlaceholderText(/Diagnostic Test/i);
    fireEvent.change(titleInput, { target: { value: 'Business Law Test 2' } });

    const weakInput = screen.getByPlaceholderText(/Consideration/i);
    fireEvent.change(weakInput, { target: { value: 'Offer & Acceptance, Consideration' } });

    const submitBtn = screen.getByRole('button', { name: /Save Test Score/i });
    fireEvent.click(submitBtn);

    expect(screen.getByText(/Weak: Offer & Acceptance/i)).toBeInTheDocument();
  });
});
