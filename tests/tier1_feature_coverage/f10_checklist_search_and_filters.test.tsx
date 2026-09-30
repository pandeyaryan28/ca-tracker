import { describe, it, expect, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { DataProvider } from '@/context/DataContext';
import { ChecklistView } from '@/components/checklist/ChecklistView';

describe('Tier 1 - Feature 10: Checklist Search & Multi-Criteria Filtering', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('filters topics by subject pills (e.g. BLAW)', () => {
    render(
      <DataProvider>
        <ChecklistView />
      </DataProvider>
    );

    const blawPill = screen.getByText(/BLAW - Law/i);
    fireEvent.click(blawPill);

    expect(screen.getByText('Business Laws')).toBeInTheDocument();
    expect(screen.queryByText('Quantitative Aptitude')).not.toBeInTheDocument();
  });

  it('filters topics by status (Pending, In Progress, Completed)', () => {
    render(
      <DataProvider>
        <ChecklistView />
      </DataProvider>
    );

    const completedFilter = screen.getByRole('button', { name: /^Completed$/i });
    fireEvent.click(completedFilter);

    // Seed topics are initially pending, so completed filter should show empty state
    expect(screen.getByText(/No matching topics found/i)).toBeInTheDocument();
  });

  it('performs tokenized search matching topic titles', () => {
    render(
      <DataProvider>
        <ChecklistView />
      </DataProvider>
    );

    const searchInput = screen.getByPlaceholderText(/Search topics/i);
    fireEvent.change(searchInput, { target: { value: 'Contract' } });

    expect(screen.getAllByText(/Contract/i).length).toBeGreaterThan(0);
  });

  it('filters by schedule state (Due Today, Overdue, Scheduled, Unscheduled)', () => {
    render(
      <DataProvider>
        <ChecklistView />
      </DataProvider>
    );

    const unscheduledFilter = screen.getByText('Unscheduled');
    fireEvent.click(unscheduledFilter);

    expect(screen.queryByText(/No matching topics found/i)).not.toBeInTheDocument();
  });

  it('displays empty state card when search query has no matches and provides reset', () => {
    render(
      <DataProvider>
        <ChecklistView />
      </DataProvider>
    );

    const searchInput = screen.getByPlaceholderText(/Search topics/i);
    fireEvent.change(searchInput, { target: { value: 'NonExistentTopicQueryXYZ123' } });

    expect(screen.getByText(/No matching topics found/i)).toBeInTheDocument();
    const clearBtn = screen.getByText('Clear All Filters');
    fireEvent.click(clearBtn);

    expect(screen.queryByText(/No matching topics found/i)).not.toBeInTheDocument();
  });
});
