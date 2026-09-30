import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { DataProvider, useData } from '@/context/DataContext';
import { STORAGE_KEYS, DEFAULT_USER_SETTINGS } from '@/lib/constants';

const wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <DataProvider>{children}</DataProvider>
);

describe('Adversarial Stress Test: Corrupted LocalStorage Recovery', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('recovers gracefully from truncated or syntax-broken JSON strings', () => {
    localStorage.setItem(STORAGE_KEYS.TOPICS, '{"truncated": [1, 2, 3');
    localStorage.setItem(STORAGE_KEYS.REVISIONS, '{invalid_json');
    localStorage.setItem(STORAGE_KEYS.TESTS, 'undefined');
    localStorage.setItem(STORAGE_KEYS.SETTINGS, '[not_an_object}');

    const { result } = renderHook(() => useData(), { wrapper });

    expect(result.current.topics).toHaveLength(99);
    expect(result.current.chapters).toHaveLength(46);
    expect(result.current.subjects).toHaveLength(4);
    expect(result.current.revisions).toEqual([]);
    expect(result.current.tests).toEqual([]);
    expect(result.current.settings.examDate).toBe(DEFAULT_USER_SETTINGS.examDate);
    expect(result.current.metrics.overallProgressPercentage).toBe(0);
  });

  it('handles primitive non-array data stored in array storage keys', () => {
    localStorage.setItem(STORAGE_KEYS.TOPICS, '"string_instead_of_array"');
    localStorage.setItem(STORAGE_KEYS.REVISIONS, '42');
    localStorage.setItem(STORAGE_KEYS.TESTS, 'true');
    localStorage.setItem(STORAGE_KEYS.SETTINGS, '"string_settings"');

    const { result } = renderHook(() => useData(), { wrapper });

    expect(result.current.topics).toHaveLength(99);
    expect(result.current.revisions).toEqual([]);
    expect(result.current.tests).toEqual([]);
    expect(result.current.settings.dailyGoalHours).toBe(6.0);
  });

  it('handles empty arrays in storage without crashing', () => {
    localStorage.setItem(STORAGE_KEYS.TOPICS, '[]');
    localStorage.setItem(STORAGE_KEYS.REVISIONS, '[]');
    localStorage.setItem(STORAGE_KEYS.TESTS, '[]');

    const { result } = renderHook(() => useData(), { wrapper });

    // Empty saved topics should fallback to seed syllabus (99 topics)
    expect(result.current.topics).toHaveLength(99);
    expect(result.current.revisions).toEqual([]);
    expect(result.current.tests).toEqual([]);
  });

  it('handles localStorage getItem throwing access errors (Security / Sandbox mode)', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('SecurityError: The operation is insecure.');
    });

    const { result } = renderHook(() => useData(), { wrapper });

    expect(result.current.topics).toHaveLength(99);
    expect(result.current.chapters).toHaveLength(46);
    expect(result.current.metrics.totalTopics).toBe(99);
  });

  it('handles localStorage setItem throwing QuotaExceededError silently', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      const err = new Error('QuotaExceededError: DOM Exception 22');
      err.name = 'QuotaExceededError';
      throw err;
    });

    const { result } = renderHook(() => useData(), { wrapper });
    expect(result.current.topics).toHaveLength(99);
  });
});
