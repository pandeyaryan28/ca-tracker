import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, renderHook, act } from '@testing-library/react';
import { DataProvider, useData } from '@/context/DataContext';
import { ChecklistView } from '@/components/checklist/ChecklistView';
import { STORAGE_KEYS, DEFAULT_USER_SETTINGS } from '@/lib/constants';

const wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <DataProvider>{children}</DataProvider>
);

describe('Chapter Completion & Target Exam Date Persistence', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('Target Exam Date Persistence via localStorage', () => {
    it('persists examDate to localStorage when updateSettings is called', async () => {
      const { result } = renderHook(() => useData(), { wrapper });

      await act(async () => {
        await result.current.updateSettings({ examDate: '2027-05-15' });
      });

      expect(result.current.settings.examDate).toBe('2027-05-15');

      // Verify localStorage was written synchronously
      const stored = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      expect(stored).toBeTruthy();
      const parsed = JSON.parse(stored!);
      expect(parsed.examDate).toBe('2027-05-15');
    });

    it('hydrates custom examDate from localStorage on initial render without reset', () => {
      // Pre-seed localStorage with custom examDate before Provider mounts
      const customSettings = {
        ...DEFAULT_USER_SETTINGS,
        examDate: '2027-06-20',
      };
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(customSettings));

      const { result } = renderHook(() => useData(), { wrapper });

      // Must immediately reflect the cached custom date
      expect(result.current.settings.examDate).toBe('2027-06-20');
    });
  });

  describe('Chapter Completion Ticking in Checklist', () => {
    it('batch updates all topics in a chapter when toggled via batchUpdateTopicStatus', async () => {
      const { result } = renderHook(() => useData(), { wrapper });

      const firstGroup = Object.values(result.current.subjectGroups)[0];
      const firstChapter = firstGroup.chapters[0];
      const topicIds = firstChapter.topics.map((t) => t.id);

      expect(firstChapter.completedTopicsCount).toBe(0);

      // Mark entire chapter completed
      await act(async () => {
        if (result.current.batchUpdateTopicStatus) {
          await result.current.batchUpdateTopicStatus(topicIds, 'completed');
        }
      });

      const updatedGroup = Object.values(result.current.subjectGroups)[0];
      const updatedChapter = updatedGroup.chapters[0];
      expect(updatedChapter.completedTopicsCount).toBe(updatedChapter.totalTopicsCount);

      // Mark entire chapter back to pending
      await act(async () => {
        if (result.current.batchUpdateTopicStatus) {
          await result.current.batchUpdateTopicStatus(topicIds, 'pending');
        }
      });

      const finalGroup = Object.values(result.current.subjectGroups)[0];
      const finalChapter = finalGroup.chapters[0];
      expect(finalChapter.completedTopicsCount).toBe(0);
    });

    it('renders chapter toggle button and ticks chapter when clicked in ChecklistView', async () => {
      render(
        <DataProvider>
          <ChecklistView />
        </DataProvider>
      );

      // Find first chapter toggle button
      const toggleButtons = screen.getAllByLabelText(/Mark chapter .* as completed/i);
      expect(toggleButtons.length).toBeGreaterThan(0);

      // Click the first chapter toggle button
      await act(async () => {
        fireEvent.click(toggleButtons[0]);
      });

      // The chapter should now be completed and show "Completed" badge
      expect(screen.getAllByText(/Completed/i).length).toBeGreaterThan(0);

      // The toggle button label should now offer to mark as pending
      const pendingToggleButtons = screen.getAllByLabelText(/Mark chapter .* as pending/i);
      expect(pendingToggleButtons.length).toBeGreaterThan(0);
    });
  });
});
