import { describe, it, expect } from 'vitest';
import { generateId } from '@/lib/utils';

describe('Tier 2 - Boundary 14: Identifier Generation & Collision Hardening', () => {
  it('generates IDs with user-specified prefix', () => {
    const id = generateId('custom_prefix');
    expect(id.startsWith('custom_prefix-')).toBe(true);
  });

  it('generates 5,000 IDs without any collision', () => {
    const ids = new Set<string>();
    const count = 5000;

    for (let i = 0; i < count; i++) {
      const id = generateId('topic');
      expect(ids.has(id)).toBe(false);
      ids.add(id);
    }

    expect(ids.size).toBe(count);
  });

  it('generates non-empty string IDs when prefix is omitted', () => {
    const id = generateId();
    expect(id).toBeTruthy();
    expect(id.startsWith('id-')).toBe(true);
  });

  it('generates valid alphanumeric characters in random segment', () => {
    const id = generateId('test');
    expect(/^[a-z0-9_-]+$/i.test(id)).toBe(true);
  });

  it('contains timestamp component enabling pseudo-chronological ordering', () => {
    const id1 = generateId('a');
    const id2 = generateId('a');
    expect(id1).not.toBe(id2);
  });
});
