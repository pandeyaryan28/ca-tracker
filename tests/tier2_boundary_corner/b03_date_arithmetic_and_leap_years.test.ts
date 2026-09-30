import { describe, it, expect } from 'vitest';
import { addDaysToDate, getDaysRemaining, formatDate } from '@/lib/utils';

describe('Tier 2 - Boundary 3: Date Arithmetic, Leap Years & Boundary Dates', () => {
  it('correctly handles leap year Feb 28 to Feb 29 transition', () => {
    expect(addDaysToDate('2024-02-28', 1)).toBe('2024-02-29');
    expect(addDaysToDate('2024-02-29', 1)).toBe('2024-03-01');
  });

  it('correctly handles non-leap year Feb 28 to March 1 transition', () => {
    expect(addDaysToDate('2025-02-28', 1)).toBe('2025-03-01');
    expect(addDaysToDate('2026-02-28', 1)).toBe('2026-03-01');
  });

  it('correctly handles year wrap-around from Dec 31 to Jan 1', () => {
    expect(addDaysToDate('2026-12-31', 1)).toBe('2027-01-01');
    expect(addDaysToDate('2026-12-31', 31)).toBe('2027-01-31');
  });

  it('handles negative day subtractions across month and year boundaries', () => {
    expect(addDaysToDate('2026-01-01', -1)).toBe('2025-12-31');
    expect(addDaysToDate('2026-03-01', -1)).toBe('2026-02-28');
  });

  it('formats invalid or corrupt date strings gracefully', () => {
    expect(formatDate(null)).toBe('Not set');
    expect(formatDate(undefined)).toBe('Not set');
    expect(formatDate('')).toBe('Not set');
    expect(formatDate('invalid-date-string')).toBe('invalid-date-string');
  });
});
