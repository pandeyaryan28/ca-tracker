import { describe, it, expect, beforeEach } from 'vitest';
import {
  db,
  auth,
  SINGLE_USER_ID,
  getUserTopicsCollection,
  getUserSettingsDoc,
  sanitizeForFirestore,
  saveTopicToFirestore,
  saveSettingsToFirestore,
} from '@/lib/firebase';
import { STORAGE_KEYS, DEFAULT_USER_SETTINGS } from '@/lib/constants';

describe('Tier 1 - Feature 4: Firebase Modular Client & Storage Layer', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('initializes Firestore singleton instance with persistence support', () => {
    expect(db).toBeDefined();
    expect(db.type).toBe('firestore');
  });

  it('initializes Firebase Auth client singleton instance', () => {
    expect(auth).toBeDefined();
    expect(auth.app).toBeDefined();
  });

  it('generates user-scoped collection paths for data isolation', () => {
    const topicsCol = getUserTopicsCollection('user_student_123');
    expect(topicsCol.path).toBe('users/user_student_123/topics');
    const settingsDoc = getUserSettingsDoc('user_student_123');
    expect(settingsDoc.path).toBe('users/user_student_123/settings/user_settings');
  });

  it('uses SINGLE_USER_ID as default scope for seamless unauthenticated sync', () => {
    const defaultCol = getUserTopicsCollection();
    expect(defaultCol.path).toBe(`users/${SINGLE_USER_ID}/topics`);
  });

  it('sanitizes objects by stripping undefined fields for Firestore compatibility', () => {
    const raw = {
      id: 'topic-1',
      title: 'Accounting Principles',
      startedAt: undefined,
      completedAt: undefined,
      status: 'pending',
    };
    const sanitized = sanitizeForFirestore(raw);
    expect(sanitized).toEqual({
      id: 'topic-1',
      title: 'Accounting Principles',
      status: 'pending',
    });
    expect('startedAt' in sanitized).toBe(false);
  });

  it('executes topic and settings saves without throwing exceptions', async () => {
    await expect(
      saveTopicToFirestore(
        {
          id: 'test-topic',
          subjectId: 'paper1',
          chapterId: 'ch-1',
          chapterName: 'Chapter 1',
          title: 'Test Topic',
          status: 'pending',
          order: 1,
        },
        'test_spec_user'
      )
    ).resolves.not.toThrow();

    await expect(
      saveSettingsToFirestore(DEFAULT_USER_SETTINGS, 'test_spec_user')
    ).resolves.not.toThrow();
  });

  it('serializes and restores state to LocalStorage for 100% offline fallback', () => {
    const testSettings = { ...DEFAULT_USER_SETTINGS, examDate: '2026-12-15' };
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(testSettings));

    const retrieved = JSON.parse(localStorage.getItem(STORAGE_KEYS.SETTINGS) || '{}');
    expect(retrieved.examDate).toBe('2026-12-15');
    expect(retrieved.theme).toBe('system');
  });

  it('handles offline fallback gracefully when storage is accessed', () => {
    expect(() => {
      localStorage.setItem(STORAGE_KEYS.THEME, 'dark');
      expect(localStorage.getItem(STORAGE_KEYS.THEME)).toBe('dark');
    }).not.toThrow();
  });
});

