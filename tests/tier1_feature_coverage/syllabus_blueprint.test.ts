import { describe, it, expect } from 'vitest';
import blueprint from '@/data/syllabus_blueprint.json';
import { loadSeedSyllabus } from '@/lib/seedLoader';

describe('Tier 1: ICAI Syllabus Blueprint Data Integrity (Feature #3)', () => {
  it('contains the official 4-paper syllabus root blueprint', () => {
    expect(blueprint.id).toBe('icai-ca-foundation-syllabus-may2026-onwards');
    expect(blueprint.totalPapers).toBe(4);
    expect(blueprint.totalMarks).toBe(400);
    expect(blueprint.passingCriteria.individualPaperMinPercentage).toBe(40);
    expect(blueprint.passingCriteria.aggregateMinPercentage).toBe(50);
  });

  it('contains exactly 4 subjects with valid metadata', () => {
    expect(blueprint.subjects).toHaveLength(4);
    const codes = blueprint.subjects.map((s) => s.code);
    expect(codes).toContain('ACC');
    expect(codes).toContain('BLAW');
    expect(codes).toContain('QA');
    expect(codes).toContain('BECO');
  });

  it('loads all 46 chapters with valid weightage and difficulty ratings', () => {
    const seed = loadSeedSyllabus();
    expect(seed.chapters).toHaveLength(46);

    for (const ch of seed.chapters) {
      expect(ch.id).toBeTruthy();
      expect(ch.title).toBeTruthy();
      expect(ch.topics.length).toBeGreaterThan(0);
    }
  });

  it('seeds all 99 topics with positive estimated time and zero duplicate IDs', () => {
    const seed = loadSeedSyllabus();
    expect(seed.topics).toHaveLength(99);

    const ids = new Set<string>();
    for (const top of seed.topics) {
      expect(ids.has(top.id)).toBe(false);
      ids.add(top.id);
      expect(top.estimatedMinutes).toBeGreaterThan(0);
      expect(top.status).toBe('pending');
    }
    expect(ids.size).toBe(99);
  });

  it('confirms aggregate passing threshold requires minimum 200 marks', () => {
    expect(blueprint.passingCriteria.aggregateMinMarks).toBe(200);
    expect(blueprint.passingCriteria.individualPaperMinMarks).toBe(40);
  });
});
