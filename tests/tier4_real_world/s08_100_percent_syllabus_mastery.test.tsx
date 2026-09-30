import { describe, it, expect, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { DataProvider, useData } from '@/context/DataContext';
import { DashboardView } from '@/components/dashboard/DashboardView';

const MasterAllTopicsHarness = () => {
  const { topics, updateTopicStatus } = useData();

  return (
    <div>
      <button
        onClick={() => {
          topics.forEach((t) => updateTopicStatus(t.id, 'completed'));
        }}
      >
        Complete All 129 Topics
      </button>
      <DashboardView />
    </div>
  );
};

describe('Tier 4 - Scenario 8: 100% Full Syllabus Mastery Milestone', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('completes all 129 topics, validates 100% completion in header banner, 0 remaining study hours, and On Track likelihood', () => {
    render(
      <DataProvider>
        <MasterAllTopicsHarness />
      </DataProvider>
    );

    // Initial state
    expect(screen.getByText(/Syllabus Completion:/i)).toBeInTheDocument();

    // Complete all topics
    fireEvent.click(screen.getByText('Complete All 129 Topics'));

    // 100% Syllabus completion banner
    expect(screen.getAllByText(/100%/).length).toBeGreaterThan(0);
    expect(screen.getByText(/0 hrs of study remaining/i)).toBeInTheDocument();
    expect(screen.getByText('On Track')).toBeInTheDocument();
  });
});
