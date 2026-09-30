import { describe, it, expect, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { DataProvider } from '@/context/DataContext';
import { TestsView } from '@/components/tests/TestsView';

describe('Tier 3 - Combination 3: Test Scores -> Weakness Index -> Revision Planning', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('logs test with weak topic tags and displays tagged topic in Chapter Weakness Index', () => {
    render(
      <DataProvider>
        <TestsView />
      </DataProvider>
    );

    const logBtn = screen.getByRole('button', { name: /Log Test Score/i });
    fireEvent.click(logBtn);

    const titleInput = screen.getByPlaceholderText(/Diagnostic Test/i);
    fireEvent.change(titleInput, { target: { value: 'Partnership Diagnostic Test' } });

    const weakInput = screen.getByPlaceholderText(/Consideration/i);
    fireEvent.change(weakInput, { target: { value: 'Dissolution of Firm, Goodwill Valuation' } });

    const submitBtn = screen.getByRole('button', { name: /Save Test Score/i });
    fireEvent.click(submitBtn);

    expect(screen.getByText(/Chapter Weakness Index/i)).toBeInTheDocument();
    expect(screen.getByText('Dissolution of Firm')).toBeInTheDocument();
    expect(screen.getByText('Goodwill Valuation')).toBeInTheDocument();
  });
});
