import { describe, it, expect } from 'vitest';
import { formatMinutes, formatHours } from '@/lib/utils';

describe('Tier 2 - Boundary 13: Duration & Time String Formatting Bounds', () => {
  it('formats 0 minutes and negative durations safely as "0m"', () => {
    expect(formatMinutes(0)).toBe('0m');
    expect(formatMinutes(-50)).toBe('0m');
  });

  it('formats boundary minute values around 1 hour (59m, 60m, 61m)', () => {
    expect(formatMinutes(59)).toBe('59m');
    expect(formatMinutes(60)).toBe('1h');
    expect(formatMinutes(61)).toBe('1h 1m');
  });

  it('formats large multi-hour durations (e.g. 750m -> "12h 30m")', () => {
    expect(formatMinutes(750)).toBe('12h 30m');
  });

  it('formats integer and fractional study hours correctly', () => {
    expect(formatHours(0)).toBe('0 hrs');
    expect(formatHours(1)).toBe('1 hrs');
    expect(formatHours(1.5)).toBe('1.5 hrs');
    expect(formatHours(2.25)).toBe('2.3 hrs');
  });

  it('handles NaN and non-finite numbers safely', () => {
    expect(formatMinutes(NaN)).toBe('0m');
    expect(formatMinutes(Infinity)).toBe('0m');
    expect(formatHours(NaN)).toBe('0 hrs');
  });
});
