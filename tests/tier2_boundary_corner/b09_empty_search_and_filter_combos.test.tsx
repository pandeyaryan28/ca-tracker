import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { DataProvider } from '@/context/DataContext';
import { ChecklistView } from '@/components/checklist/ChecklistView';

describe('Tier 2 - Boundary 9: Special Regex Search & Contradictory Filter Combos', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date('2026-09-01T08:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('handles search query with regex special chars `.*+?^${}()|[]\\` without crashing', () => {
    render(
      <DataProvider>
        <ChecklistView />
      </DataProvider>
    );

    const searchInput = screen.getByPlaceholderText(/Search topics/i);
    fireEvent.change(searchInput, { target: { value: '.*+?^${}()|[]\\' } });

    expect(screen.getByText(/No matching topics found/i)).toBeInTheDocument();
  });

  it('handles combination of Paper 4 + Completed Status when no topics are completed', () => {
    render(
      <DataProvider>
        <ChecklistView />
      </DataProvider>
    );

    const becoPill = screen.getByText(/BECO - Economics/i);
    fireEvent.click(becoPill);

    const completedBtn = screen.getByRole('button', { name: /^Completed$/i });
    fireEvent.click(completedBtn);

    expect(screen.getByText(/No matching topics found/i)).toBeInTheDocument();
  });

  it('handles combination of Overdue Filter on fresh pending topics without target dates', () => {
    render(
      <DataProvider>
        <ChecklistView />
      </DataProvider>
    );

    const overdueFilter = screen.getByText('Overdue');
    fireEvent.click(overdueFilter);

    expect(screen.getByText(/No matching topics found/i)).toBeInTheDocument();
  });

  it('handles search queries with only whitespace characters', () => {
    render(
      <DataProvider>
        <ChecklistView />
      </DataProvider>
    );

    const searchInput = screen.getByPlaceholderText(/Search topics/i);
    fireEvent.change(searchInput, { target: { value: '     ' } });

    expect(screen.queryByText(/No matching topics found/i)).not.toBeInTheDocument();
  });

  it('restores all syllabus topics when filters are reset', () => {
    render(
      <DataProvider>
        <ChecklistView />
      </DataProvider>
    );

    const searchInput = screen.getByPlaceholderText(/Search topics/i);
    fireEvent.change(searchInput, { target: { value: 'ImpossibleNonExistentQuery' } });
    expect(screen.getByText(/No matching topics found/i)).toBeInTheDocument();

    const clearBtn = screen.getByText('Clear All Filters');
    fireEvent.click(clearBtn);

    expect(screen.queryByText(/No matching topics found/i)).not.toBeInTheDocument();
  });
});
