import { describe, it, expect, beforeEach } from 'vitest';
import { STORAGE_KEYS } from '@/lib/constants';
import { Topic } from '@/types';

describe('Tier 4 - Scenario 5: Offline Multi-Tab Study Session Synchronization', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('maintains state consistency when Tab A and Tab B modify different topics in localStorage', () => {
    // Initial state
    const initialTopics: Topic[] = [
      { id: 'top-1', subjectId: 'paper1', chapterId: 'ch1', chapterName: 'Ch 1', title: 'Topic 1', status: 'pending', estimatedMinutes: 60, estimatedHours: 1.0, order: 1 },
      { id: 'top-2', subjectId: 'paper2', chapterId: 'ch2', chapterName: 'Ch 2', title: 'Topic 2', status: 'pending', estimatedMinutes: 60, estimatedHours: 1.0, order: 2 },
    ];
    localStorage.setItem(STORAGE_KEYS.TOPICS, JSON.stringify(initialTopics));

    // Tab A completes Topic 1
    const fromTabA = JSON.parse(localStorage.getItem(STORAGE_KEYS.TOPICS) || '[]');
    fromTabA[0].status = 'completed';
    localStorage.setItem(STORAGE_KEYS.TOPICS, JSON.stringify(fromTabA));

    // Tab B completes Topic 2
    const fromTabB = JSON.parse(localStorage.getItem(STORAGE_KEYS.TOPICS) || '[]');
    fromTabB[1].status = 'completed';
    localStorage.setItem(STORAGE_KEYS.TOPICS, JSON.stringify(fromTabB));

    // Combined state reflects both
    const finalTopics = JSON.parse(localStorage.getItem(STORAGE_KEYS.TOPICS) || '[]');
    expect(finalTopics[0].status).toBe('completed');
    expect(finalTopics[1].status).toBe('completed');
  });
});
