import { describe, it, expect } from 'vitest';
import { calculateNextRevisionDate, getRevisionBaseInterval } from '@/lib/utils';

describe('Tier 2 - Boundary 12: Spaced Repetition Formula & Multiplier Bounds', () => {
  const baseDate = '2026-09-01';

  it('calculates Low confidence intervals (0.5x multiplier) with minimum 1-day floor', () => {
    // R1: 3 * 0.5 = 1.5 -> rounded to 2 days
    expect(calculateNextRevisionDate(baseDate, 1, 'low')).toBe('2026-09-03');
    // R2: 7 * 0.5 = 3.5 -> rounded to 4 days
    expect(calculateNextRevisionDate(baseDate, 2, 'low')).toBe('2026-09-05');
  });

  it('calculates Medium confidence intervals (1.0x multiplier)', () => {
    expect(calculateNextRevisionDate(baseDate, 1, 'medium')).toBe('2026-09-04');
    expect(calculateNextRevisionDate(baseDate, 2, 'medium')).toBe('2026-09-08');
    expect(calculateNextRevisionDate(baseDate, 3, 'medium')).toBe('2026-09-15');
  });

  it('calculates High confidence intervals (2.0x multiplier)', () => {
    // R1: 3 * 2 = 6 days
    expect(calculateNextRevisionDate(baseDate, 1, 'high')).toBe('2026-09-07');
    // R2: 7 * 2 = 14 days
    expect(calculateNextRevisionDate(baseDate, 2, 'high')).toBe('2026-09-15');
    // R3: 14 * 2 = 28 days
    expect(calculateNextRevisionDate(baseDate, 3, 'high')).toBe('2026-09-29');
  });

  it('caps base intervals at 45 days for cycle 5 and beyond', () => {
    expect(getRevisionBaseInterval(5)).toBe(45);
    expect(getRevisionBaseInterval(10)).toBe(45);
    expect(getRevisionBaseInterval(100)).toBe(45);
  });

  it('handles negative or 0 cycle values by defaulting to R1 base interval', () => {
    expect(getRevisionBaseInterval(0)).toBe(3);
    expect(getRevisionBaseInterval(-5)).toBe(3);
  });
});
