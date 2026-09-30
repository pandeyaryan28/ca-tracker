import { describe, it, expect } from 'vitest';
import { calculateNextRevisionDate, getRevisionBaseInterval, getConfidenceMultiplier } from '@/lib/utils';

describe('Tier 1 - Feature 15: Spaced Revision Planner Formula & Interval Schedule', () => {
  const baseDate = '2026-09-01';

  it('calculates base intervals for cycles R1, R2, R3, R4, R5+', () => {
    expect(getRevisionBaseInterval(1)).toBe(3);
    expect(getRevisionBaseInterval(2)).toBe(7);
    expect(getRevisionBaseInterval(3)).toBe(14);
    expect(getRevisionBaseInterval(4)).toBe(30);
    expect(getRevisionBaseInterval(5)).toBe(45);
    expect(getRevisionBaseInterval(10)).toBe(45);
  });

  it('applies confidence multipliers: Low (0.5x), Medium (1.0x), High (2.0x)', () => {
    expect(getConfidenceMultiplier('low')).toBe(0.5);
    expect(getConfidenceMultiplier('medium')).toBe(1.0);
    expect(getConfidenceMultiplier('high')).toBe(2.0);
  });

  it('calculates R1 next target date with Medium confidence (+3 days)', () => {
    const nextDate = calculateNextRevisionDate(baseDate, 1, 'medium');
    expect(nextDate).toBe('2026-09-04');
  });

  it('calculates R2 next target date with High confidence (+14 days)', () => {
    const nextDate = calculateNextRevisionDate(baseDate, 2, 'high');
    expect(nextDate).toBe('2026-09-15');
  });

  it('calculates R3 next target date with Low confidence (+7 days)', () => {
    const nextDate = calculateNextRevisionDate(baseDate, 3, 'low');
    expect(nextDate).toBe('2026-09-08');
  });
});
