import { describe, it, expect, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { App } from '@/App';

describe('Tier 4 - Scenario 7: Mobile Touch Viewport Audit & Dock Navigation', () => {
  beforeEach(() => {
    localStorage.clear();
    window.innerWidth = 375;
    window.innerHeight = 667;
    window.dispatchEvent(new Event('resize'));
  });

  it('navigates seamlessly using navigation buttons across all main views on mobile screen', () => {
    render(<App />);

    // 1. Initial Dashboard
    expect(screen.getByText('Command Center')).toBeInTheDocument();

    // 2. Tap Checklist
    const checklistBtns = screen.getAllByRole('button', { name: /checklist/i });
    act(() => {
      fireEvent.click(checklistBtns[0]);
    });
    expect(screen.getByText('Accounting')).toBeInTheDocument();

    // 3. Tap Ingestion Hub
    const ingestionBtns = screen.getAllByRole('button', { name: /ingestion/i });
    act(() => {
      fireEvent.click(ingestionBtns[0]);
    });
    expect(screen.getByText('Schedule Ingestion & Data Management Hub')).toBeInTheDocument();
  });
});
