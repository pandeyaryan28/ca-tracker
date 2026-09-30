import { describe, it, expect } from 'vitest';
import { generateId } from '@/lib/utils';
import { loadSeedSyllabus } from '@/lib/seedLoader';

describe('Adversarial Stress Test: ID Collision & Entropy', () => {
  it('generates 100,000 unique IDs without a single collision', () => {
    const totalCount = 100_000;
    const generatedIds = new Set<string>();

    for (let i = 0; i < totalCount; i++) {
      const id = generateId('stress');
      expect(generatedIds.has(id)).toBe(false);
      generatedIds.add(id);
    }

    expect(generatedIds.size).toBe(totalCount);
  });

  it('generates IDs with correct prefix and format constraints', () => {
    const prefixes = ['test', 'rev', 'topic-custom', '', 'p1_acc', 'special@sym#'];
    for (const prefix of prefixes) {
      const id = generateId(prefix);
      expect(id.startsWith(prefix ? `${prefix}-` : '-')).toBe(true);
      const parts = id.split('-');
      expect(parts.length).toBeGreaterThanOrEqual(3);
    }
  });

  it('verifies strict seed syllabus ID uniqueness and namespace isolation', () => {
    const seed = loadSeedSyllabus();
    
    // Topic IDs
    const topicIdSet = new Set<string>();
    for (const topic of seed.topics) {
      expect(topicIdSet.has(topic.id)).toBe(false);
      expect(topic.id.trim()).not.toBe('');
      topicIdSet.add(topic.id);
    }
    expect(topicIdSet.size).toBe(99);

    // Chapter IDs
    const chapterIdSet = new Set<string>();
    for (const chapter of seed.chapters) {
      expect(chapterIdSet.has(chapter.id)).toBe(false);
      expect(chapter.id.trim()).not.toBe('');
      chapterIdSet.add(chapter.id);
    }
    expect(chapterIdSet.size).toBe(46);

    // Subject IDs
    const subjectIdSet = new Set<string>();
    for (const subject of seed.subjects) {
      expect(subjectIdSet.has(subject.id)).toBe(false);
      subjectIdSet.add(subject.id);
    }
    expect(subjectIdSet.size).toBe(4);

    // Disjoint namespaces check (no topic ID shares name with a chapter ID or subject ID)
    for (const tId of topicIdSet) {
      expect(chapterIdSet.has(tId)).toBe(false);
      expect(subjectIdSet.has(tId)).toBe(false);
    }
  });
});
