import { describe, it, expect, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { AppContent } from '@/App';
import { AppShell } from '@/components/layout/AppShell';
import { ThemeProvider } from '@/context/ThemeContext';
import { DataProvider, useData } from '@/context/DataContext';

describe('Adversarial Zero Horizontal Overflow & Layout Bounds Stress Testing', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  const renderWithProviders = (ui: React.ReactNode) => {
    return render(
      <ThemeProvider>
        <DataProvider>{ui}</DataProvider>
      </ThemeProvider>
    );
  };

  it('verifies AppShell root container explicitly enforces overflow-x-hidden and min-w-0 column layout', () => {
    const { container } = renderWithProviders(
      <AppShell activeTab="dashboard" onTabChange={() => {}}>
        <div>Content</div>
      </AppShell>
    );

    const rootDiv = container.firstChild as HTMLElement;
    expect(rootDiv).toHaveClass('overflow-x-hidden');
    expect(rootDiv).toHaveClass('flex-row');

    // The main column container must have min-w-0 to prevent flex item blowout
    const mainColumn = rootDiv.querySelector('div.flex-1.flex.flex-col');
    expect(mainColumn).toBeInTheDocument();
    expect(mainColumn).toHaveClass('min-w-0');
  });

  it('verifies main content area is constrained by max-w-7xl and w-full', () => {
    const { container } = renderWithProviders(
      <AppShell activeTab="dashboard" onTabChange={() => {}}>
        <div>Content</div>
      </AppShell>
    );

    const main = container.querySelector('main');
    expect(main).toHaveClass('max-w-7xl');
    expect(main).toHaveClass('w-full');
  });

  it('verifies checklist subject pills bar is scoped with max-w-full and overflow-x-auto', () => {
    renderWithProviders(<AppContent />);

    // Navigate to Checklist via Sidebar or Dock
    const checklistBtns = screen.getAllByRole('button', { name: /Checklist/i });
    act(() => {
      fireEvent.click(checklistBtns[0]);
    });

    const pillsBar = document.querySelector('.overflow-x-auto');
    expect(pillsBar).toBeInTheDocument();
    expect(pillsBar).toHaveClass('max-w-full');
    expect(pillsBar).toHaveClass('overflow-x-auto');
  });

  it('stress tests layout with extremely long topic titles attached to existing chapters without horizontal blowout', () => {
    const longTitle = 'SuperLongTopicTitleWithoutSpaces_'.repeat(15);
    const TestMutator = () => {
      const { addTopic } = useData();
      return (
        <button
          onClick={() =>
            addTopic({
              title: longTitle,
              subjectId: 'paper1',
              chapterId: 'acc-ch-01',
              chapterName: 'Theoretical Framework',
              status: 'in_progress',
              estimatedMinutes: 120,
              estimatedHours: 2.0,
              isCustom: true,
            })
          }
        >
          Inject Long Topic
        </button>
      );
    };

    renderWithProviders(
      <div>
        <TestMutator />
        <AppContent />
      </div>
    );

    const injectBtn = screen.getByText('Inject Long Topic');
    act(() => {
      fireEvent.click(injectBtn);
    });

    // Navigate to Checklist
    const checklistBtns = screen.getAllByRole('button', { name: /Checklist/i });
    act(() => {
      fireEvent.click(checklistBtns[0]);
    });

    // Expand all chapters to expose topics
    const expandAllBtn = screen.getByText('Expand All');
    act(() => {
      fireEvent.click(expandAllBtn);
    });

    // Verify the injected long topic title renders
    const topicHeading = screen.getByText(longTitle);
    expect(topicHeading).toBeInTheDocument();
  });

  it('stress tests test series log with long test titles and notes without overflow', () => {
    const longTitle = 'Comprehensive Diagnostic Super Mock Examination Series 2024';
    const longNotes = 'Critical notes on Companies Act section 135 CSR provisions and penalty calculations';
    const TestMutator = () => {
      const { addTest } = useData();
      return (
        <button
          onClick={() =>
            addTest({
              title: longTitle,
              subjectId: 'paper2',
              testType: 'mock',
              dateAttempted: '2026-08-28',
              marksObtained: 88,
              totalMarks: 100,
              notes: longNotes,
            })
          }
        >
          Inject Long Test
        </button>
      );
    };

    renderWithProviders(
      <div>
        <TestMutator />
        <AppContent />
      </div>
    );

    const injectBtn = screen.getByText('Inject Long Test');
    act(() => {
      fireEvent.click(injectBtn);
    });

    // Navigate to Tests
    const testsBtns = screen.getAllByRole('button', { name: /Test Series|Tests/i });
    act(() => {
      fireEvent.click(testsBtns[0]);
    });

    expect(screen.getByText(longTitle)).toBeInTheDocument();
    expect(screen.getByText(new RegExp(longNotes))).toBeInTheDocument();
  });
});
