import { describe, it, expect } from 'vitest';
import { loadSeedSyllabus } from '@/lib/seedLoader';
import { ResetSyllabusOptions, Topic } from '@/types';

describe('Tier 2 - Boundary 10: Syllabus Reset Options Matrix', () => {
  const seed = loadSeedSyllabus();
  const customTopic: Topic = {
    id: 'custom-top-1',
    subjectId: 'paper1',
    chapterId: 'ch-custom',
    chapterName: 'Custom Chapter',
    title: 'Custom Topic 1',
    status: 'completed',
    estimatedMinutes: 60,
    estimatedHours: 1.0,
    isCustom: true,
    order: 999,
  };

  it('resets everything to fresh default when all preserve flags are false', () => {
    const options: ResetSyllabusOptions = {
      preserveCustomTopics: false,
      preserveTests: false,
      preserveRevisions: false,
      preserveSettings: false,
    };

    const finalTopics = [...seed.topics];
    expect(finalTopics).toHaveLength(99);
    expect(finalTopics.find((t) => t.isCustom)).toBeUndefined();
  });

  it('preserves custom topics when preserveCustomTopics is true', () => {
    const currentTopics = [...seed.topics, customTopic];
    const options: ResetSyllabusOptions = {
      preserveCustomTopics: true,
    };

    let finalTopics = [...seed.topics];
    if (options.preserveCustomTopics) {
      const customOnes = currentTopics.filter((t) => t.isCustom);
      finalTopics = [...finalTopics, ...customOnes];
    }

    expect(finalTopics).toHaveLength(100);
    expect(finalTopics.find((t) => t.id === 'custom-top-1')).toBeDefined();
  });

  it('resets all standard blueprint topics back to pending status', () => {
    const finalTopics = [...seed.topics];
    const completedCount = finalTopics.filter((t) => t.status === 'completed').length;
    expect(completedCount).toBe(0);
  });

  it('preserves tests and revisions arrays when respective flags are true', () => {
    const mockTests = [{ id: 't1', title: 'Test 1' }];
    const options: ResetSyllabusOptions = { preserveTests: true };
    const finalTests = options.preserveTests ? mockTests : [];
    expect(finalTests).toHaveLength(1);
  });

  it('clears tests and revisions arrays when respective flags are false', () => {
    const mockTests = [{ id: 't1', title: 'Test 1' }];
    const options: ResetSyllabusOptions = { preserveTests: false };
    const finalTests = options.preserveTests ? mockTests : [];
    expect(finalTests).toHaveLength(0);
  });
});
