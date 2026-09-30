import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { App } from '@/App';

describe('Tier 1: Responsive Dual Navigation Shell (Feature #2)', () => {
  it('renders all core shell components without layout shifts or errors', () => {
    render(<App />);

    // Header brand and view title
    expect(screen.getByText('Command Center')).toBeInTheDocument();

    // Desktop sidebar brand
    expect(screen.getByText('CA Tracker')).toBeInTheDocument();

    // Check bottom dock and sidebar buttons exist
    const dashboardButtons = screen.getAllByRole('button', { name: /dashboard/i });
    expect(dashboardButtons.length).toBeGreaterThan(0);
  });

  it('allows navigating to Ingestion Hub from dock/sidebar', () => {
    render(<App />);

    const ingestionButtons = screen.getAllByRole('button', { name: /ingestion/i });
    act(() => {
      fireEvent.click(ingestionButtons[0]);
    });

    expect(
      screen.getByText('Schedule Ingestion & Data Management Hub')
    ).toBeInTheDocument();
  });

  it('allows navigating to Checklist view', () => {
    render(<App />);
    const checklistButtons = screen.getAllByRole('button', { name: /checklist/i });
    act(() => {
      fireEvent.click(checklistButtons[0]);
    });
    expect(screen.getByText('Accounting')).toBeInTheDocument();
  });

  it('allows navigating to Tests view', () => {
    render(<App />);
    const testButtons = screen.getAllByRole('button', { name: /tests/i });
    act(() => {
      fireEvent.click(testButtons[0]);
    });
    expect(screen.getByText('Mock Test Series & Performance Analytics')).toBeInTheDocument();
  });

  it('allows navigating to Revisions view', () => {
    render(<App />);
    const revisionButtons = screen.getAllByRole('button', { name: /revisions/i });
    act(() => {
      fireEvent.click(revisionButtons[0]);
    });
    expect(screen.getByText('Spaced Repetition & Mistake Notebook')).toBeInTheDocument();
  });
});
