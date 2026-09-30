import { describe, it, expect, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { App } from '@/App';

describe('Tier 3 - Combination 12: Theme Toggle Persistence Across View Navigation', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('persists theme state when navigating across multiple views in the app', () => {
    render(<App />);

    // Navigate to Checklist
    const checklistBtn = screen.getAllByRole('button', { name: /checklist/i })[0];
    act(() => {
      fireEvent.click(checklistBtn);
    });

    expect(screen.getByText('Accounting')).toBeInTheDocument();

    // Navigate to Ingestion
    const ingestionBtn = screen.getAllByRole('button', { name: /ingestion/i })[0];
    act(() => {
      fireEvent.click(ingestionBtn);
    });

    expect(screen.getByText('Schedule Ingestion & Data Management Hub')).toBeInTheDocument();
  });
});
