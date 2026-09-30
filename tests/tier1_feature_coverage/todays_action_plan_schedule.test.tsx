import { describe, it, expect, beforeEach, vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { DataProvider } from '@/context/DataContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { DashboardView } from '@/components/dashboard/DashboardView';
import { generateActionPlan, calculateDashboardMetrics, loadSeedSyllabus, loadSeedSchedule } from '@/lib/seedLoader';
import { DEFAULT_USER_SETTINGS } from '@/lib/constants';

vi.mock('canvas-confetti', () => ({ default: vi.fn() }));

vi.mock('@/lib/firebase', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/firebase')>();
  return {
    ...actual,
    saveSettingsToFirestore: vi.fn().mockResolvedValue(undefined),
    saveTopicToFirestore: vi.fn().mockResolvedValue(undefined),
    saveScheduleEntryToFirestore: vi.fn().mockResolvedValue(undefined),
    subscribeToUserData: vi.fn().mockImplementation(() => () => {}),
  };
});

describe("Today's Action Plan from Schedule Integration", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date('2026-09-09T08:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('generates action plan items directly from schedule entries for today', () => {
    const seed = loadSeedSyllabus();
    const schedule = loadSeedSchedule();

    // With schedule passed, generateActionPlan returns the 4 items for 2026-09-09
    const actionPlan = generateActionPlan(seed.topics, [], [], schedule);

    expect(actionPlan.length).toBeGreaterThanOrEqual(4);

    const titles = actionPlan.map((item) => item.title);
    expect(titles).toContain('P&C complete, ch-5');
    expect(titles).toContain('SOGA, 1930 complete');
    expect(titles).toContain('Rectification of errors complete, ch-2');
    expect(titles).toContain('BRS complete, ch-3');

    // Permutations item details
    const pandc = actionPlan.find((i) => i.title === 'P&C complete, ch-5');
    expect(pandc).toBeDefined();
    expect(pandc?.subjectId).toBe('paper3');
    expect(pandc?.chapterName).toBe('Permutations and Combinations');
    expect(pandc?.isCompleted).toBe(false);
    expect(pandc?.scheduleEntryId).toBe('sch-09-01');
  });

  it('calculates dashboard metrics reflecting scheduled today action items', () => {
    const seed = loadSeedSyllabus();
    const schedule = loadSeedSchedule();

    const metrics = calculateDashboardMetrics(
      seed.topics,
      [],
      [],
      DEFAULT_USER_SETTINGS,
      schedule
    );

    expect(metrics.todayActionItemsTotal).toBe(4);
    expect(metrics.todayActionItemsCompleted).toBe(0);
  });

  it('renders scheduled items in DashboardView under Today\'s Action Plan', () => {
    render(
      <ThemeProvider>
        <DataProvider>
          <DashboardView onNavigate={vi.fn()} />
        </DataProvider>
      </ThemeProvider>
    );

    // Section header and counter
    expect(screen.getByText("Today's Action Plan")).toBeInTheDocument();
    expect(screen.getByText(/0 \/ 4 Done/i)).toBeInTheDocument();

    // 4 handwritten schedule tasks
    expect(screen.getByText('P&C complete, ch-5')).toBeInTheDocument();
    expect(screen.getByText('SOGA, 1930 complete')).toBeInTheDocument();
    expect(screen.getByText('Rectification of errors complete, ch-2')).toBeInTheDocument();
    expect(screen.getByText('BRS complete, ch-3')).toBeInTheDocument();

    // Navigation shortcut button
    expect(screen.getByRole('button', { name: /View Full Schedule/i })).toBeInTheDocument();
  });

  it('completes a scheduled task from Today\'s Action Plan on 1-tap Complete', async () => {
    render(
      <ThemeProvider>
        <DataProvider>
          <DashboardView />
        </DataProvider>
      </ThemeProvider>
    );

    expect(screen.getByText(/0 \/ 4 Done/i)).toBeInTheDocument();

    // Click Complete on the first task ('P&C complete, ch-5')
    const completeButtons = screen.getAllByRole('button', { name: /Complete/i });
    expect(completeButtons.length).toBeGreaterThanOrEqual(4);

    await act(async () => {
      fireEvent.click(completeButtons[0]);
    });

    // Should now update counter to 1 / 4 Done
    expect(screen.getByText(/1 \/ 4 Done/i)).toBeInTheDocument();

    // Done badge should appear for the completed item
    expect(screen.getByText('✓ Done')).toBeInTheDocument();
  });

  it('invokes onNavigate("schedule") when clicking View Full Schedule button', () => {
    const onNavigateMock = vi.fn();
    render(
      <ThemeProvider>
        <DataProvider>
          <DashboardView onNavigate={onNavigateMock} />
        </DataProvider>
      </ThemeProvider>
    );

    const viewScheduleBtn = screen.getByRole('button', { name: /View Full Schedule/i });
    fireEvent.click(viewScheduleBtn);

    expect(onNavigateMock).toHaveBeenCalledWith('schedule');
  });
});
