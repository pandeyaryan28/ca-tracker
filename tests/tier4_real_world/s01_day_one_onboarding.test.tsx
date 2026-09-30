import { describe, it, expect, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { App } from '@/App';

describe('Tier 4 - Scenario 1: Student Day 1 Onboarding Journey', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('completes onboarding: views initial 0% dashboard, inspects 4 subject gauges, sets custom exam date', () => {
    render(<App />);

    // 1. Dashboard is displayed initially
    expect(screen.getByText('Command Center')).toBeInTheDocument();
    expect(screen.getByText(/Syllabus Completion:/i)).toBeInTheDocument();

    // 2. Inspect 4 Paper sections
    expect(screen.getByText('Official 4-Paper Progress')).toBeInTheDocument();

    // 3. Open Exam Date picker modal
    const editDateBtn = screen.getByRole('button', { name: /Edit Exam Date/i });
    fireEvent.click(editDateBtn);

    expect(screen.getByText('Set CA Foundation Exam Date')).toBeInTheDocument();

    // 4. Set date to Dec 15, 2026
    const dateInput = screen.getByDisplayValue(/2026/);
    fireEvent.change(dateInput, { target: { value: '2026-12-15' } });

    const saveBtn = screen.getByRole('button', { name: /Save Date/i });
    fireEvent.click(saveBtn);

    // 5. Navigate to Checklist to inspect official syllabus
    const checklistBtn = screen.getAllByRole('button', { name: /checklist/i })[0];
    act(() => {
      fireEvent.click(checklistBtn);
    });

    expect(screen.getByText('Accounting')).toBeInTheDocument();
    expect(screen.getByText('Business Laws')).toBeInTheDocument();
  });
});
