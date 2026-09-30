import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { App } from '@/App';

describe('AppShell & Navigation Architecture', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders App with Dashboard as initial active view', () => {
    render(<App />);

    expect(screen.getByText('Command Center')).toBeInTheDocument();
    expect(screen.getByText(/Syllabus Completion:/i)).toBeInTheDocument();
    expect(screen.getByText(/Official 4-Paper Progress/i)).toBeInTheDocument();
  });

  it('navigates seamlessly across all primary tabs', () => {
    render(<App />);

    // 1. Navigate to Checklist
    const checklistButtons = screen.getAllByRole('button', { name: /checklist/i });
    act(() => {
      fireEvent.click(checklistButtons[0]);
    });
    expect(screen.getByText('Accounting')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Search topics, chapters/i)).toBeInTheDocument();

    // 2. Navigate to Tests
    const testsButtons = screen.getAllByRole('button', { name: /test series/i });
    act(() => {
      fireEvent.click(testsButtons[0]);
    });
    expect(screen.getByText('Mock Test Series & Performance Analytics')).toBeInTheDocument();

    // 3. Navigate to Revisions
    const revButtons = screen.getAllByRole('button', { name: /revisions/i });
    act(() => {
      fireEvent.click(revButtons[0]);
    });
    expect(screen.getByText('Spaced Repetition & Mistake Notebook')).toBeInTheDocument();

    // 4. Navigate to Ingestion
    const ingButtons = screen.getAllByRole('button', { name: /ingestion hub/i });
    act(() => {
      fireEvent.click(ingButtons[0]);
    });
    expect(screen.getByText('Schedule Ingestion & Data Management Hub')).toBeInTheDocument();

    // 5. Navigate to Settings
    const setButtons = screen.getAllByRole('button', { name: /settings/i });
    act(() => {
      fireEvent.click(setButtons[0]);
    });
    expect(screen.getByText('App Preferences & Settings')).toBeInTheDocument();
  });

  it('displays streak and exam countdown metrics in the header', () => {
    render(<App />);

    expect(screen.getAllByText(/0d/i).length).toBeGreaterThan(0); // Streak
    expect(screen.getByText(/left/i)).toBeInTheDocument(); // Countdown
  });
});
