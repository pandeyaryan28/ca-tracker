import { describe, it, expect, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { DataProvider, useData } from '@/context/DataContext';
import { addDaysToDate, getTodayDateString } from '@/lib/utils';

const PaceRecalculationHarness = () => {
  const { settings, updateSettings, metrics } = useData();
  const today = getTodayDateString();

  return (
    <div>
      <div data-testid="days">{metrics.daysUntilExam}</div>
      <div data-testid="examDate">{settings.examDate}</div>
      <button onClick={() => updateSettings({ examDate: addDaysToDate(today, 100) })}>
        Set 100 Days Out
      </button>
      <button onClick={() => updateSettings({ examDate: addDaysToDate(today, 10) })}>
        Set 10 Days Out
      </button>
    </div>
  );
};

describe('Tier 3 - Combination 6: Target Exam Date Update -> Live Countdown Recalculation', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('updates remaining days and pace projections dynamically when exam target date changes', () => {
    render(
      <DataProvider>
        <PaceRecalculationHarness />
      </DataProvider>
    );

    fireEvent.click(screen.getByText('Set 100 Days Out'));
    expect(screen.getByTestId('days').textContent).toBe('100');

    fireEvent.click(screen.getByText('Set 10 Days Out'));
    expect(screen.getByTestId('days').textContent).toBe('10');
  });
});
