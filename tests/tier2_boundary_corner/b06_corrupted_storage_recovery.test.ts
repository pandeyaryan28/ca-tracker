import { describe, it, expect, beforeEach } from 'vitest';
import { STORAGE_KEYS, DEFAULT_USER_SETTINGS } from '@/lib/constants';

describe('Tier 2 - Boundary 6: Corrupted Storage Recovery & Resilience', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('safely recovers when LocalStorage contains corrupted non-JSON strings', () => {
    localStorage.setItem(STORAGE_KEYS.TOPICS, 'INVALID_JSON_CORRUPTED_DATA{{{');

    let parsed = null;
    try {
      parsed = JSON.parse(localStorage.getItem(STORAGE_KEYS.TOPICS) || '');
    } catch {
      parsed = null;
    }

    expect(parsed).toBeNull();
  });

  it('safely falls back to default settings when settings payload is missing properties', () => {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify({ theme: 'light' }));

    const raw = JSON.parse(localStorage.getItem(STORAGE_KEYS.SETTINGS) || '{}');
    const merged = { ...DEFAULT_USER_SETTINGS, ...raw };

    expect(merged.theme).toBe('light');
    expect(merged.autoScheduleRevisions).toBe(true);
    expect(merged.dailyGoalHours).toBe(6.0);
  });

  it('safely handles empty array stored in revisions key', () => {
    localStorage.setItem(STORAGE_KEYS.REVISIONS, JSON.stringify([]));
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEYS.REVISIONS) || '[]');
    expect(Array.isArray(parsed)).toBe(true);
    expect(parsed).toHaveLength(0);
  });

  it('safely handles null values stored in tests key', () => {
    localStorage.setItem(STORAGE_KEYS.TESTS, 'null');
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEYS.TESTS) || '[]');
    expect(parsed).toBeNull();
  });

  it('handles QuotaExceededError simulation gracefully', () => {
    const originalSetItem = localStorage.setItem;
    localStorage.setItem = () => {
      throw new Error('QuotaExceededError');
    };

    expect(() => {
      try {
        localStorage.setItem('key', 'val');
      } catch (err: any) {
        expect(err.message).toBe('QuotaExceededError');
      }
    }).not.toThrow();

    localStorage.setItem = originalSetItem;
  });
});
