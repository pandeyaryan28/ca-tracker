import { describe, it, expect, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { DataProvider } from '@/context/DataContext';
import { ChecklistView } from '@/components/checklist/ChecklistView';

describe('Tier 1 - Feature 8: Hierarchical Lesson Checklist (3-Tier Tree)', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders all 4 official paper sections in the hierarchy', () => {
    render(
      <DataProvider>
        <ChecklistView />
      </DataProvider>
    );

    expect(screen.getByText('Accounting')).toBeInTheDocument();
    expect(screen.getByText('Business Laws')).toBeInTheDocument();
    expect(screen.getByText('Quantitative Aptitude')).toBeInTheDocument();
    expect(screen.getByText('Business Economics')).toBeInTheDocument();
  });

  it('displays chapter accordion headers with chapter titles', () => {
    render(
      <DataProvider>
        <ChecklistView />
      </DataProvider>
    );

    expect(screen.getByText(/Theoretical Framework/i)).toBeInTheDocument();
  });

  it('toggles chapter expansion on accordion header click', () => {
    render(
      <DataProvider>
        <ChecklistView />
      </DataProvider>
    );

    const chapterBtn = screen.getByText(/Theoretical Framework/i).closest('button');
    expect(chapterBtn).toBeInTheDocument();
    if (chapterBtn) {
      fireEvent.click(chapterBtn);
      // Toggle again
      fireEvent.click(chapterBtn);
    }
  });

  it('has all chapters collapsed by default and exposes units on clicking down arrow', () => {
    render(
      <DataProvider>
        <ChecklistView />
      </DataProvider>
    );

    // By default, topic units are collapsed / hidden
    expect(screen.queryByTitle(/Status:/i)).not.toBeInTheDocument();

    const chapterBtn = screen.getByText(/Theoretical Framework/i).closest('button');
    expect(chapterBtn).toHaveAttribute('aria-expanded', 'false');

    // Click to expand
    fireEvent.click(chapterBtn!);
    expect(chapterBtn).toHaveAttribute('aria-expanded', 'true');

    // Units and 1-tap status buttons are now exposed
    const toggleButtons = screen.getAllByTitle(/Status:/i);
    expect(toggleButtons.length).toBeGreaterThan(0);
  });

  it('provides Expand All and Collapse All controls', () => {
    render(
      <DataProvider>
        <ChecklistView />
      </DataProvider>
    );

    const expandAllBtn = screen.getByText('Expand All');
    const collapseAllBtn = screen.getByText('Collapse All');

    expect(expandAllBtn).toBeInTheDocument();
    expect(collapseAllBtn).toBeInTheDocument();

    fireEvent.click(collapseAllBtn);
    fireEvent.click(expandAllBtn);
  });
});
