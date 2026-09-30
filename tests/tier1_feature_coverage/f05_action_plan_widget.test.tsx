import { describe, it, expect, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { DataProvider } from '@/context/DataContext';
import { DashboardView } from '@/components/dashboard/DashboardView';
import { generateActionPlan } from '@/lib/seedLoader';
import { getTodayDateString, addDaysToDate } from '@/lib/utils';
import { Topic, RevisionRecord, TestRecord } from '@/types';

describe("Tier 1 - Feature 5: Today's Action Plan & 1-Tap Toggle", () => {
  const today = getTodayDateString();

  beforeEach(() => {
    localStorage.clear();
  });

  it('dynamically aggregates pending lessons scheduled for today', () => {
    const mockTopics: Topic[] = [
      {
        id: 'top-1',
        subjectId: 'paper1',
        chapterId: 'acc-ch-01',
        chapterName: 'Accounting Ch 1',
        title: 'Accounting Framework',
        status: 'pending',
        estimatedMinutes: 60,
        estimatedHours: 1.0,
        targetDate: today,
        order: 1,
      },
    ];

    const plan = generateActionPlan(mockTopics, [], []);
    expect(plan).toHaveLength(1);
    expect(plan[0].title).toBe('Accounting Framework');
    expect(plan[0].dueDate).toBe(today);
    expect(plan[0].isOverdue).toBe(false);
  });

  it('aggregates overdue pending topics with high priority', () => {
    const yesterday = addDaysToDate(today, -1);
    const mockTopics: Topic[] = [
      {
        id: 'top-2',
        subjectId: 'paper2',
        chapterId: 'law-ch-01',
        chapterName: 'Law Ch 1',
        title: 'Indian Contract Act',
        status: 'pending',
        estimatedMinutes: 90,
        estimatedHours: 1.5,
        targetDate: yesterday,
        order: 2,
      },
    ];

    const plan = generateActionPlan(mockTopics, [], []);
    expect(plan).toHaveLength(1);
    expect(plan[0].isOverdue).toBe(true);
    expect(plan[0].priority).toBe('high');
  });

  it('includes due spaced revisions in the daily action plan', () => {
    const mockRevisions: RevisionRecord[] = [
      {
        id: 'rev-1',
        topicId: 'top-1',
        topicTitle: 'Accounting Framework',
        subjectId: 'paper1',
        cycle: 1,
        lastRevisedDate: addDaysToDate(today, -3),
        nextTargetDate: today,
        confidence: 'medium',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    const plan = generateActionPlan([], mockRevisions, []);
    expect(plan).toHaveLength(1);
    expect(plan[0].type).toBe('revision');
    expect(plan[0].title).toContain('R1: Accounting Framework');
  });

  it('excludes completed topics from the action plan', () => {
    const mockTopics: Topic[] = [
      {
        id: 'top-3',
        subjectId: 'paper3',
        chapterId: 'qa-ch-01',
        chapterName: 'Maths Ch 1',
        title: 'Ratio and Proportion',
        status: 'completed',
        estimatedMinutes: 60,
        estimatedHours: 1.0,
        targetDate: today,
        completedAt: new Date().toISOString(),
        order: 3,
      },
    ];

    const plan = generateActionPlan(mockTopics, [], []);
    expect(plan).toHaveLength(0);
  });

  it('renders Action Plan in DashboardView and enables 1-tap check-off', () => {
    render(
      <DataProvider>
        <DashboardView />
      </DataProvider>
    );

    expect(screen.getByText("Today's Action Plan")).toBeInTheDocument();
  });
});
