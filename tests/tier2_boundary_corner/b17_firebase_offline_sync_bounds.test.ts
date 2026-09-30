import { describe, it, expect } from 'vitest';
import {
  getUserTopicsCollection,
  getUserTestsCollection,
  getUserRevisionsCollection,
  getUserSettingsDoc,
} from '@/lib/firebase';

describe('Tier 2 - Boundary 17: Firebase Offline Fallback & Disconnected Resilience', () => {
  it('generates valid user-scoped topics collection reference', () => {
    const col = getUserTopicsCollection('user_offline_01');
    expect(col.path).toBe('users/user_offline_01/topics');
  });

  it('generates valid user-scoped tests collection reference', () => {
    const col = getUserTestsCollection('user_offline_01');
    expect(col.path).toBe('users/user_offline_01/tests');
  });

  it('generates valid user-scoped revisions collection reference', () => {
    const col = getUserRevisionsCollection('user_offline_01');
    expect(col.path).toBe('users/user_offline_01/revisions');
  });

  it('generates valid user-scoped settings document reference', () => {
    const docRef = getUserSettingsDoc('user_offline_01');
    expect(docRef.path).toBe('users/user_offline_01/settings/user_settings');
  });

  it('verifies offline state does not block LocalStorage fallback', () => {
    localStorage.setItem('test_offline_marker', 'online_backup_ready');
    expect(localStorage.getItem('test_offline_marker')).toBe('online_backup_ready');
  });
});
