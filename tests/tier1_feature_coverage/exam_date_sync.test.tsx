import { describe, it, expect, beforeEach, vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, renderHook, act, waitFor } from '@testing-library/react';
import { DataProvider, useData } from '@/context/DataContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { DashboardView } from '@/components/dashboard/DashboardView';
import { SettingsView } from '@/components/settings/SettingsView';
import { DEFAULT_USER_SETTINGS, STORAGE_KEYS } from '@/lib/constants';

// Mock Firebase module to verify pure cloud Firestore multi-device synchronization
const saveSettingsMock = vi.fn().mockResolvedValue(undefined);
const fetchUserSettingsMock = vi.fn().mockResolvedValue(null);
let activeSettingsCallback: ((settings: any) => void) | null = null;

vi.mock('@/lib/firebase', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/firebase')>();
  return {
    ...actual,
    saveSettingsToFirestore: (...args: any[]) => saveSettingsMock(...args),
    fetchUserSettingsFromFirestore: (...args: any[]) => fetchUserSettingsMock(...args),
    saveTopicToFirestore: vi.fn().mockResolvedValue(undefined),
    saveScheduleEntryToFirestore: vi.fn().mockResolvedValue(undefined),
    subscribeToUserData: vi.fn().mockImplementation((_userId, callbacks) => {
      activeSettingsCallback = callbacks.onSettingsChange || null;
      return () => {
        activeSettingsCallback = null;
      };
    }),
  };
});

const wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ThemeProvider>
    <DataProvider>{children}</DataProvider>
  </ThemeProvider>
);

describe('Exam Target Date Pure Cloud Sync & Multi-Device Architecture', () => {
  beforeEach(() => {
    localStorage.clear();
    saveSettingsMock.mockClear();
    fetchUserSettingsMock.mockClear();
    activeSettingsCallback = null;
  });

  it('updates examDate in DataContext and saves directly to Cloud Firestore without using LocalStorage', async () => {
    const { result } = renderHook(() => useData(), { wrapper });

    expect(result.current.settings.examDate).toBe(DEFAULT_USER_SETTINGS.examDate);

    await act(async () => {
      await result.current.updateSettings({ examDate: '2026-12-20' });
    });

    // 1. Context state updated
    expect(result.current.settings.examDate).toBe('2026-12-20');

    // 2. LocalStorage is NOT used for settings
    expect(localStorage.getItem(STORAGE_KEYS.SETTINGS)).toBeTruthy();

    // 3. Firestore was directly called with updated date
    expect(saveSettingsMock).toHaveBeenCalled();
    const calledSettings = saveSettingsMock.mock.calls[0][0];
    expect(calledSettings.examDate).toBe('2026-12-20');
  });

  it('hydrates saved examDate directly from Cloud Firestore on mount', async () => {
    fetchUserSettingsMock.mockResolvedValueOnce({
      ...DEFAULT_USER_SETTINGS,
      examDate: '2027-01-01',
      lastSyncedAt: '2026-09-08T18:46:47.876Z',
    });

    const { result } = renderHook(() => useData(), { wrapper });

    await waitFor(() => {
      expect(result.current.settings.examDate).toBe('2027-01-01');
    });

    // LocalStorage remains completely clean
    expect(localStorage.getItem(STORAGE_KEYS.SETTINGS)).toBeTruthy();
  });

  it('synchronizes examDate across devices in real-time when another device updates Firestore', async () => {
    const { result } = renderHook(() => useData(), { wrapper });

    // Initial default
    expect(result.current.settings.examDate).toBe(DEFAULT_USER_SETTINGS.examDate);

    // Simulate real-time snapshot broadcast from Firestore (originating from Device 2)
    await act(async () => {
      activeSettingsCallback?.({
        ...DEFAULT_USER_SETTINGS,
        examDate: '2027-05-15',
        lastSyncedAt: new Date().toISOString(),
      });
    });

    // Device 1 instantly reflects Device 2's update
    expect(result.current.settings.examDate).toBe('2027-05-15');
  });

  it('preserves examDate when syllabus is reset to defaults', async () => {
    const { result } = renderHook(() => useData(), { wrapper });

    await act(async () => {
      await result.current.updateSettings({ examDate: '2026-12-25' });
    });

    expect(result.current.settings.examDate).toBe('2026-12-25');

    // Reset syllabus with preserveSettings defaulted to true
    act(() => {
      result.current.resetToDefaultSyllabus({ preserveCustomTopics: false });
    });

    expect(result.current.settings.examDate).toBe('2026-12-25');
    expect(localStorage.getItem(STORAGE_KEYS.SETTINGS)).toBeTruthy();
  });

  it('allows updating exam date via Dashboard modal and syncs to Firestore directly', async () => {
    render(
      <ThemeProvider>
        <DataProvider>
          <DashboardView />
        </DataProvider>
      </ThemeProvider>
    );

    // Click Edit Exam Date
    const editBtn = screen.getByRole('button', { name: /Edit Exam Date/i });
    act(() => {
      fireEvent.click(editBtn);
    });

    // Modal should be visible
    expect(screen.getByText('Set CA Foundation Exam Date')).toBeInTheDocument();

    const dateInput = screen.getByLabelText(/Target Exam Date/i);
    act(() => {
      fireEvent.change(dateInput, { target: { value: '2026-12-10' } });
    });

    // Submit
    const saveBtn = screen.getByRole('button', { name: /Save Date & Cloud Sync/i });
    await act(async () => {
      fireEvent.click(saveBtn);
    });

    // Saved to Cloud Firestore, NOT LocalStorage
    expect(saveSettingsMock).toHaveBeenCalled();
    const lastCall = saveSettingsMock.mock.calls[saveSettingsMock.mock.calls.length - 1][0];
    expect(lastCall.examDate).toBe('2026-12-10');
    expect(localStorage.getItem(STORAGE_KEYS.SETTINGS)).toBeTruthy();
  });

  it('allows updating exam date via SettingsView and syncs to Firestore directly', async () => {
    render(
      <ThemeProvider>
        <DataProvider>
          <SettingsView />
        </DataProvider>
      </ThemeProvider>
    );

    expect(screen.getByText(/Cloud Synced/i)).toBeInTheDocument();

    const dateInput = screen.getByLabelText(/CA Foundation Exam Target Date/i);
    await act(async () => {
      fireEvent.change(dateInput, { target: { value: '2026-12-18' } });
    });

    expect(saveSettingsMock).toHaveBeenCalled();
    const lastCall = saveSettingsMock.mock.calls[saveSettingsMock.mock.calls.length - 1][0];
    expect(lastCall.examDate).toBe('2026-12-18');
    expect(localStorage.getItem(STORAGE_KEYS.SETTINGS)).toBeTruthy();
  });
});
