import { describe, it, expect, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { DataProvider, useData } from '@/context/DataContext';

const TestComponent = () => {
  const { topics, updateTopicStatus, revisions } = useData();
  const firstTopic = topics[0];

  return (
    <div>
      <div data-testid="status">{firstTopic?.status}</div>
      <div data-testid="startedAt">{firstTopic?.startedAt || 'none'}</div>
      <div data-testid="completedAt">{firstTopic?.completedAt || 'none'}</div>
      <div data-testid="revisionsCount">{revisions.length}</div>
      <button
        onClick={() => updateTopicStatus(firstTopic.id, 'in_progress')}
        data-testid="btn-progress"
      >
        To Progress
      </button>
      <button
        onClick={() => updateTopicStatus(firstTopic.id, 'completed')}
        data-testid="btn-complete"
      >
        To Complete
      </button>
      <button
        onClick={() => updateTopicStatus(firstTopic.id, 'pending')}
        data-testid="btn-pending"
      >
        To Pending
      </button>
    </div>
  );
};

describe('Tier 1 - Feature 9: Status Transitions & Automatic Timestamp Logging', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('transitions from pending to in_progress and records startedAt timestamp', async () => {
    render(
      <DataProvider>
        <TestComponent />
      </DataProvider>
    );

    expect(screen.getByTestId('status').textContent).toBe('pending');
    fireEvent.click(screen.getByTestId('btn-progress'));

    expect(screen.getByTestId('status').textContent).toBe('in_progress');
    expect(screen.getByTestId('startedAt').textContent).not.toBe('none');
  });

  it('transitions from in_progress to completed and records completedAt timestamp', async () => {
    render(
      <DataProvider>
        <TestComponent />
      </DataProvider>
    );

    fireEvent.click(screen.getByTestId('btn-complete'));
    expect(screen.getByTestId('status').textContent).toBe('completed');
    expect(screen.getByTestId('completedAt').textContent).not.toBe('none');
  });

  it('auto-schedules R1 spaced revision upon topic completion', async () => {
    render(
      <DataProvider>
        <TestComponent />
      </DataProvider>
    );

    fireEvent.click(screen.getByTestId('btn-complete'));
    expect(Number(screen.getByTestId('revisionsCount').textContent)).toBeGreaterThanOrEqual(1);
  });

  it('clears completedAt timestamp when reset back to pending', async () => {
    render(
      <DataProvider>
        <TestComponent />
      </DataProvider>
    );

    fireEvent.click(screen.getByTestId('btn-complete'));
    expect(screen.getByTestId('completedAt').textContent).not.toBe('none');

    fireEvent.click(screen.getByTestId('btn-pending'));
    expect(screen.getByTestId('status').textContent).toBe('pending');
    expect(screen.getByTestId('completedAt').textContent).toBe('none');
  });

  it('ensures startedAt is monotonic and <= completedAt', async () => {
    render(
      <DataProvider>
        <TestComponent />
      </DataProvider>
    );

    fireEvent.click(screen.getByTestId('btn-progress'));
    fireEvent.click(screen.getByTestId('btn-complete'));

    const started = screen.getByTestId('startedAt').textContent || '';
    const completed = screen.getByTestId('completedAt').textContent || '';

    expect(new Date(started).getTime()).toBeLessThanOrEqual(new Date(completed).getTime());
  });
});
