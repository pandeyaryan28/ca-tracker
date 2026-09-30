import { describe, it, expect, beforeEach, vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { DataProvider } from '@/context/DataContext';
import { ScheduleView } from '@/components/schedule/ScheduleView';
import { ChecklistView } from '@/components/checklist/ChecklistView';
import { loadSeedSchedule, loadSeedSyllabus } from '@/lib/seedLoader';

// Mock canvas-confetti to prevent jsdom canvas errors
vi.mock('canvas-confetti', () => ({
  default: vi.fn(),
}));

// Mock Firebase module to prevent network calls during testing
vi.mock('@/lib/firebase', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/firebase')>();
  return {
    ...actual,
    saveScheduleEntryToFirestore: vi.fn().mockResolvedValue(undefined),
    deleteScheduleEntryFromFirestore: vi.fn().mockResolvedValue(undefined),
    syncScheduleWithCloud: vi.fn().mockImplementation(async (entries) => entries),
    saveTopicToFirestore: vi.fn().mockResolvedValue(undefined),
    subscribeToUserData: vi.fn().mockImplementation((userId, callbacks) => () => {}),
  };
});

describe('Study Schedule & Interactive Calendar Integration', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('Seed Schedule Data Fidelity', () => {
    it('loads exactly 25 scheduled items spanning September 9 to September 20, 2026', () => {
      const schedule = loadSeedSchedule();
      expect(schedule.length).toBe(25);

      const dates = Array.from(new Set(schedule.map((s) => s.date))).sort();
      expect(dates).toEqual([
        '2026-09-09',
        '2026-09-10',
        '2026-09-11',
        '2026-09-12',
        '2026-09-13',
        '2026-09-14',
        '2026-09-15',
        '2026-09-16',
        '2026-09-17',
        '2026-09-18',
        '2026-09-19',
        '2026-09-20',
      ]);
    });

    it('strictly matches the handwritten notes for September 9 through September 11', () => {
      const schedule = loadSeedSchedule();

      // Sept 9
      const sept9 = schedule.filter((s) => s.date === '2026-09-09');
      expect(sept9).toHaveLength(4);
      expect(sept9.some((s) => s.title.includes('P&C complete') && s.subjectId === 'paper3')).toBe(true);
      expect(sept9.some((s) => s.title.includes('SOGA, 1930 complete') && s.subjectId === 'paper2')).toBe(true);
      expect(sept9.some((s) => s.title.includes('Rectification of errors complete') && s.subjectId === 'paper1')).toBe(true);
      expect(sept9.some((s) => s.title.includes('BRS complete') && s.subjectId === 'paper1')).toBe(true);

      // Sept 10
      const sept10 = schedule.filter((s) => s.date === '2026-09-10');
      expect(sept10).toHaveLength(2);
      expect(sept10.some((s) => s.title.includes('Annuity') && s.subjectId === 'paper3')).toBe(true);
      expect(sept10.some((s) => s.title.includes('IPA') && s.subjectId === 'paper2')).toBe(true);

      // Sept 11
      const sept11 = schedule.filter((s) => s.date === '2026-09-11');
      expect(sept11).toHaveLength(3);
      expect(sept11.some((s) => s.title.includes('Inventories') && s.subjectId === 'paper1')).toBe(true);
      expect(sept11.some((s) => s.title.includes('Depreciation') && s.subjectId === 'paper1')).toBe(true);
      expect(sept11.some((s) => s.title.includes('Linear eq') && s.subjectId === 'paper3')).toBe(true);
    });

    it('identifies revision days accurately on Sept 12, 13, 19, and 20', () => {
      const schedule = loadSeedSchedule();

      const revisionEntries = schedule.filter((s) => s.isRevision);
      expect(revisionEntries).toHaveLength(4);

      const revisionDates = revisionEntries.map((r) => r.date).sort();
      expect(revisionDates).toEqual(['2026-09-12', '2026-09-13', '2026-09-19', '2026-09-20']);
    });

    it('injects target dates directly into syllabus blueprint topics', () => {
      const { topics } = loadSeedSyllabus();

      // Rectification topic in Paper 1 Ch 2 (acc-top-0204) should have targetDate 2026-09-09
      const rectTopic = topics.find((t) => t.id === 'acc-top-0204');
      expect(rectTopic?.targetDate).toBe('2026-09-09');

      // Sale of goods act topic in Paper 2 Ch 3
      const sogaTopic = topics.find((t) => t.id === 'law-top-0301');
      expect(sogaTopic?.targetDate).toBe('2026-09-09');
    });
  });

  describe('ScheduleView UI Component', () => {
    it('renders the schedule view with header stats and calendar view', () => {
      render(
        <DataProvider>
          <ScheduleView />
        </DataProvider>
      );

      // Header and description
      expect(screen.getByText('Daily Study Schedule & Roadmap')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Calendar/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Agenda/i })).toBeInTheDocument();

      // Today jump button
      expect(screen.getByRole('button', { name: 'Today' })).toBeInTheDocument();

      // Add task button
      expect(screen.getByRole('button', { name: /^Add Task$/i })).toBeInTheDocument();
    });

    it('switches to Timeline / Agenda view and renders day sections', () => {
      render(
        <DataProvider>
          <ScheduleView />
        </DataProvider>
      );

      // Click Agenda button
      const agendaBtn = screen.getByRole('button', { name: /Agenda/i });
      fireEvent.click(agendaBtn);

      // Verify dates are displayed (Sep 9, 2026)
      expect(screen.getByText(/Sep 9, 2026/i)).toBeInTheDocument();
      expect(screen.getAllByText(/P&C complete/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/SOGA, 1930 complete/i).length).toBeGreaterThan(0);
    });

    it('allows filtering by subject tabs', () => {
      render(
        <DataProvider>
          <ScheduleView />
        </DataProvider>
      );

      // Switch to agenda view for easy row inspection
      fireEvent.click(screen.getByRole('button', { name: /Agenda/i }));

      // Filter by Accounts
      const accFilter = screen.getByRole('button', { name: /Accounts \(ACC\)/i });
      fireEvent.click(accFilter);

      // Should show Rectification and BRS
      expect(screen.getAllByText(/Rectification of errors complete/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/BRS complete/i).length).toBeGreaterThan(0);

      // Filter by Revision Days
      const revFilter = screen.getByRole('button', { name: /Revision Days/i });
      fireEvent.click(revFilter);

      expect(screen.getAllByText(/Revision: P&C, SOGA 1930 & Rectification of Errors/i).length).toBeGreaterThan(0);
    });

    it('toggles schedule item completion and updates progress', () => {
      render(
        <DataProvider>
          <ScheduleView />
        </DataProvider>
      );

      // Switch to agenda
      fireEvent.click(screen.getByRole('button', { name: /Agenda/i }));

      // Find the toggle checkbox for first item
      const toggleButtons = screen.getAllByRole('button', { name: /^Mark /i });

      expect(toggleButtons.length).toBeGreaterThan(0);
      fireEvent.click(toggleButtons[0]);

      // Progress counter should update to 1 of 25 Done
      expect(screen.getByText(/1 of 25 Done/i)).toBeInTheDocument();
    });
  });

  describe('ChecklistView Date Badge Integration', () => {
    it('displays scheduled target date badges on chapter accordions and topics', () => {
      render(
        <DataProvider>
          <ChecklistView />
        </DataProvider>
      );
      fireEvent.click(screen.getByText('Expand All'));

      // Scheduled date badges with title or compact date format
      const scheduledBadges = screen.getAllByTitle(/Scheduled target date:/i);
      expect(scheduledBadges.length).toBeGreaterThan(0);

      // Verify "9 Sept" appears
      const sept9Pills = screen.getAllByText(/9 Sept/i);
      expect(sept9Pills.length).toBeGreaterThan(0);
    });
  });
});
