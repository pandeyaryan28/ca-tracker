import { describe, it, expect } from 'vitest';
import { SUBJECT_METADATA, SUBJECT_METADATA_MAP, DEFAULT_USER_SETTINGS, NAV_ITEMS } from '@/lib/constants';
import { calculatePercentage, formatMinutes, formatHours, getDaysRemaining, addDaysToDate } from '@/lib/utils';
import { normalizeSubjectId } from '@/lib/seedLoader';

describe('Domain Models & Types Contracts', () => {
  it('defines exactly 4 official ICAI foundation papers with correct schema', () => {
    expect(SUBJECT_METADATA).toHaveLength(4);
    
    const paperIds = SUBJECT_METADATA.map((s) => s.id);
    expect(paperIds).toEqual(['paper1', 'paper2', 'paper3', 'paper4']);

    const codes = SUBJECT_METADATA.map((s) => s.code);
    expect(codes).toEqual(['ACC', 'BLAW', 'QA', 'BECO']);

    for (const sub of SUBJECT_METADATA) {
      expect(sub.totalMarks).toBe(100);
      expect(sub.passingMarks).toBe(40);
      expect(sub.color.primary).toBeDefined();
      expect(sub.icon).toBeDefined();
      expect(sub.estimatedStudyHours).toBeGreaterThan(50);
    }
  });

  it('enforces descriptive vs objective paper formats and negative markings', () => {
    const acc = SUBJECT_METADATA_MAP['paper1'];
    const law = SUBJECT_METADATA_MAP['paper2'];
    const qa = SUBJECT_METADATA_MAP['paper3'];
    const eco = SUBJECT_METADATA_MAP['paper4'];

    expect(acc.type).toBe('Descriptive');
    expect(acc.negativeMarking).toBe(0.0);

    expect(law.type).toBe('Descriptive');
    expect(law.negativeMarking).toBe(0.0);

    expect(qa.type).toBe('Objective');
    expect(qa.negativeMarking).toBe(0.25);

    expect(eco.type).toBe('Objective');
    expect(eco.negativeMarking).toBe(0.25);
  });

  it('normalizes subject identifiers flexibly across codes and names', () => {
    expect(normalizeSubjectId('paper-1-accounting')).toBe('paper1');
    expect(normalizeSubjectId('ACC')).toBe('paper1');
    expect(normalizeSubjectId(1)).toBe('paper1');

    expect(normalizeSubjectId('paper-2-business-laws')).toBe('paper2');
    expect(normalizeSubjectId('BLAW')).toBe('paper2');
    expect(normalizeSubjectId(2)).toBe('paper2');

    expect(normalizeSubjectId('paper-3-quantitative-aptitude')).toBe('paper3');
    expect(normalizeSubjectId('QA')).toBe('paper3');
    expect(normalizeSubjectId(3)).toBe('paper3');

    expect(normalizeSubjectId('paper-4-business-economics')).toBe('paper4');
    expect(normalizeSubjectId('BECO')).toBe('paper4');
    expect(normalizeSubjectId(4)).toBe('paper4');
  });

  it('provides default user settings with valid values', () => {
    expect(DEFAULT_USER_SETTINGS.examDate).toBe('2026-11-01');
    expect(DEFAULT_USER_SETTINGS.dailyGoalHours).toBe(6.0);
    expect(DEFAULT_USER_SETTINGS.theme).toBe('system');
    expect(DEFAULT_USER_SETTINGS.soundEnabled).toBe(true);
    expect(DEFAULT_USER_SETTINGS.confettiEnabled).toBe(true);
    expect(DEFAULT_USER_SETTINGS.defaultRevisionIntervals).toEqual({
      low: 3,
      medium: 7,
      high: 14,
    });
  });

  it('includes all primary navigation tabs in order', () => {
    const tabIds = NAV_ITEMS.map((item) => item.id);
    expect(tabIds).toEqual(['dashboard', 'schedule', 'checklist', 'lectures', 'tests', 'revisions', 'ingestion', 'settings']);
  });

  it('calculates percentages correctly within bounds', () => {
    expect(calculatePercentage(0, 100)).toBe(0);
    expect(calculatePercentage(50, 100)).toBe(50);
    expect(calculatePercentage(129, 129)).toBe(100);
    expect(calculatePercentage(1, 3)).toBe(33);
    expect(calculatePercentage(0, 0)).toBe(0);
  });

  it('formats minutes and hours appropriately', () => {
    expect(formatMinutes(0)).toBe('0m');
    expect(formatMinutes(45)).toBe('45m');
    expect(formatMinutes(60)).toBe('1h');
    expect(formatMinutes(90)).toBe('1h 30m');
    expect(formatHours(12)).toBe('12 hrs');
    expect(formatHours(12.5)).toBe('12.5 hrs');
  });

  it('computes date differences and additions accurately', () => {
    const today = '2026-08-28';
    const future = '2026-09-02';
    expect(getDaysRemaining(future, today)).toBe(5);
    expect(addDaysToDate(today, 7)).toBe('2026-09-04');
  });
});
