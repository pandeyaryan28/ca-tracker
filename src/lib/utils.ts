import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { ConfidenceLevel, SubjectId, TestRecord } from '@/types';

/**
 * Merge Tailwind class names without style conflicts
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Format a date string (YYYY-MM-DD or ISO) into readable text
 */
export function formatDate(dateString?: string | null): string {
  if (!dateString || typeof dateString !== 'string') return 'Not set';
  try {
    const clean = dateString.split('T')[0];
    const parts = clean.split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10);
      const day = parseInt(parts[2], 10);
      if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
        const date = new Date(year, month - 1, day);
        if (!isNaN(date.getTime())) {
          return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          });
        }
      }
    }
    const directDate = new Date(dateString);
    if (!isNaN(directDate.getTime())) {
      return directDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    }
    return dateString;
  } catch {
    return dateString;
  }
}

/**
 * Format a date string into compact "9 Sept" format strictly matching handwritten notes
 */
export function formatCompactDate(dateString?: string | null): string {
  if (!dateString || typeof dateString !== 'string') return '';
  try {
    const clean = dateString.split('T')[0];
    const parts = clean.split('-');
    if (parts.length === 3) {
      const month = parseInt(parts[1], 10);
      const day = parseInt(parts[2], 10);
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];
      if (!isNaN(month) && !isNaN(day) && month >= 1 && month <= 12) {
        return `${day} ${months[month - 1]}`;
      }
    }
    return dateString;
  } catch {
    return dateString || '';
  }
}

/**
 * Format minutes into readable hour / minute string (e.g. 90 -> "1h 30m")
 */
export function formatMinutes(minutes: number): string {
  if (!minutes || minutes <= 0 || isNaN(minutes) || !isFinite(minutes)) return '0m';
  const hrs = Math.floor(minutes / 60);
  const mins = Math.floor(minutes % 60);
  if (hrs > 0 && mins > 0) return `${hrs}h ${mins}m`;
  if (hrs > 0) return `${hrs}h`;
  return `${mins}m`;
}

/**
 * Format hours into readable format
 */
export function formatHours(hours: number): string {
  if (!hours || hours <= 0 || isNaN(hours) || !isFinite(hours)) return '0 hrs';
  return hours % 1 === 0 ? `${hours} hrs` : `${hours.toFixed(1)} hrs`;
}

/**
 * Calculate safe percentage with decimal bounds
 */
export function calculatePercentage(part: number, total: number, decimals: number = 0): number {
  if (!total || total <= 0 || isNaN(total) || isNaN(part) || !isFinite(total) || !isFinite(part)) return 0;
  const pct = (part / total) * 100;
  if (isNaN(pct) || !isFinite(pct)) return 0;
  return Number(Math.min(100, Math.max(0, pct)).toFixed(decimals));
}

/**
 * Generate a unique random identifier with optional prefix
 */
export function generateId(prefix: string = 'id'): string {
  const rand = Math.random().toString(36).substring(2, 9);
  const timestamp = Date.now().toString(36);
  return `${prefix}-${timestamp}-${rand}`;
}

/**
 * Calculate days remaining until target date (YYYY-MM-DD)
 */
export function getDaysRemaining(targetDateStr?: string | null, fromDateStr?: string): number {
  if (!targetDateStr || typeof targetDateStr !== 'string') return 0;
  try {
    const today = fromDateStr ? new Date(fromDateStr) : new Date();
    if (isNaN(today.getTime())) {
      today.setTime(Date.now());
    }
    today.setHours(0, 0, 0, 0);

    const cleanStr = targetDateStr.split('T')[0];
    const parts = cleanStr.split('-');
    if (parts.length !== 3) {
      const direct = new Date(targetDateStr);
      if (isNaN(direct.getTime())) return 0;
      direct.setHours(0, 0, 0, 0);
      const diff = direct.getTime() - today.getTime();
      const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
      return isNaN(days) ? 0 : days;
    }

    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10);
    const day = parseInt(parts[2], 10);

    if (isNaN(year) || isNaN(month) || isNaN(day) || month < 1 || month > 12 || day < 1 || day > 31 || year < 1900 || year > 2100) {
      return 0;
    }

    const target = new Date(year, month - 1, day);
    if (isNaN(target.getTime())) {
      return 0;
    }
    if (target.getFullYear() !== year || target.getMonth() !== month - 1 || target.getDate() !== day) {
      return 0;
    }
    target.setHours(0, 0, 0, 0);

    const diffTime = target.getTime() - today.getTime();
    const result = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return isNaN(result) ? 0 : result;
  } catch {
    return 0;
  }
}

/**
 * Add days to a YYYY-MM-DD date string
 */
export function addDaysToDate(dateStr: string, days: number): string {
  try {
    const [year, month, day] = (dateStr || '').split('T')[0].split('-');
    const yearNum = parseInt(year, 10);
    const monthNum = parseInt(month, 10);
    const dayNum = parseInt(day, 10);

    let date: Date;
    if (isNaN(yearNum) || isNaN(monthNum) || isNaN(dayNum)) {
      date = new Date();
    } else {
      date = new Date(yearNum, monthNum - 1, dayNum);
      if (isNaN(date.getTime())) {
        date = new Date();
      }
    }
    date.setDate(date.getDate() + (isNaN(days) ? 0 : days));
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  } catch {
    const date = new Date();
    date.setDate(date.getDate() + (isNaN(days) ? 0 : days));
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
}

/**
 * Get today's date in YYYY-MM-DD format
 */
export function getTodayDateString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Spaced Repetition Base Interval Calculations:
 * Base intervals: R1 = +3d, R2 = +7d, R3 = +14d, R4 = +30d, R5+ = +45d
 * Multipliers: Low = 0.5, Medium = 1.0, High = 2.0
 */
export function getRevisionBaseInterval(cycle: number): number {
  if (cycle <= 1) return 3;
  if (cycle === 2) return 7;
  if (cycle === 3) return 14;
  if (cycle === 4) return 30;
  return 45;
}

export function getConfidenceMultiplier(confidence: ConfidenceLevel): number {
  switch (confidence) {
    case 'low':
      return 0.5;
    case 'medium':
      return 1.0;
    case 'high':
      return 2.0;
    default:
      return 1.0;
  }
}

export function calculateNextRevisionDate(
  lastRevisedDate: string,
  cycle: number,
  confidence: ConfidenceLevel = 'medium'
): string {
  const base = getRevisionBaseInterval(cycle);
  const mult = getConfidenceMultiplier(confidence);
  const daysToAdd = Math.max(1, Math.round(base * mult));
  return addDaysToDate(lastRevisedDate || getTodayDateString(), daysToAdd);
}

/**
 * ICAI Mock Series Evaluation Engine:
 * Individual Paper Criterion: >= 40% in each subject
 * Aggregate Criterion: >= 50% across 4 papers (200 / 400)
 */
export interface MockSeriesEvaluation {
  paperScores: Record<SubjectId, number>;
  totalMarksObtained: number;
  totalMarksPossible: number;
  aggregatePercentage: number;
  individualPaperPass: Record<SubjectId, boolean>;
  allPapersPassedIndividual: boolean;
  aggregatePassed: boolean;
  overallPassed: boolean;
  statusMessage: string;
}

export function evaluateMockSeries(tests: TestRecord[]): MockSeriesEvaluation {
  const paperScores: Record<SubjectId, number> = { paper1: 0, paper2: 0, paper3: 0, paper4: 0 };
  const individualPaperPass: Record<SubjectId, boolean> = {
    paper1: false,
    paper2: false,
    paper3: false,
    paper4: false,
  };

  const papers: SubjectId[] = ['paper1', 'paper2', 'paper3', 'paper4'];

  papers.forEach((sId) => {
    const subjectTests = tests.filter((t) => t.subjectId === sId);
    if (subjectTests.length > 0) {
      // most recent test for this paper
      const latest = subjectTests[0];
      paperScores[sId] = latest.percentage || 0;
      individualPaperPass[sId] = (latest.percentage || 0) >= 40.0;
    }
  });

  const totalMarksObtained = Object.values(paperScores).reduce((a, b) => a + b, 0);
  const totalMarksPossible = 400;
  const aggregatePercentage = Number(((totalMarksObtained / totalMarksPossible) * 100).toFixed(1));

  const allPapersPassedIndividual = Object.values(individualPaperPass).every(Boolean);
  const aggregatePassed = aggregatePercentage >= 50.0;
  const overallPassed = allPapersPassedIndividual && aggregatePassed;

  let statusMessage = 'PASSED (ICAI Qualified)';
  if (!allPapersPassedIndividual && !aggregatePassed) {
    statusMessage = 'FAILED (Both Individual Paper & Aggregate Deficiency)';
  } else if (!allPapersPassedIndividual) {
    statusMessage = 'FAILED (Individual Paper < 40% Threshold)';
  } else if (!aggregatePassed) {
    statusMessage = 'FAILED (Aggregate < 50% Threshold)';
  }

  return {
    paperScores,
    totalMarksObtained,
    totalMarksPossible,
    aggregatePercentage,
    individualPaperPass,
    allPapersPassedIndividual,
    aggregatePassed,
    overallPassed,
    statusMessage,
  };
}
