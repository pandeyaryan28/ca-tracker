import { SubjectId, SubjectMeta, NavigationItem, UserSettings } from '@/types';

export const SUBJECT_METADATA: SubjectMeta[] = [
  {
    id: 'paper1',
    paperNumber: 1,
    code: 'ACC',
    name: 'Accounting',
    shortName: 'Accounts',
    type: 'Descriptive',
    totalMarks: 100,
    passingMarks: 40,
    negativeMarking: 0.0,
    color: {
      primary: '#10B981', // Emerald
      light: '#D1FAE5',
      dark: '#065F46',
      accent: 'text-emerald-600 dark:text-emerald-400',
      border: 'border-emerald-500/30',
      glow: 'rgba(16, 185, 129, 0.2)',
      bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      darkBg: 'dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800',
    },
    icon: 'BookOpen',
    description:
      'Foundations of financial accounting, accounting standards, preparation of financial statements, partnership, and company accounts.',
    estimatedStudyHours: 140,
  },
  {
    id: 'paper2',
    paperNumber: 2,
    code: 'BLAW',
    name: 'Business Laws',
    shortName: 'Law',
    type: 'Descriptive',
    totalMarks: 100,
    passingMarks: 40,
    negativeMarking: 0.0,
    color: {
      primary: '#8B5CF6', // Violet
      light: '#EDE9FE',
      dark: '#5B21B6',
      accent: 'text-violet-600 dark:text-violet-400',
      border: 'border-violet-500/30',
      glow: 'rgba(139, 92, 246, 0.2)',
      bg: 'bg-violet-50 text-violet-700 border-violet-200',
      darkBg: 'dark:bg-violet-950/50 dark:text-violet-300 dark:border-violet-800',
    },
    icon: 'Scale',
    description:
      'Legal regulatory framework, Indian Contract Act 1872, Sale of Goods Act 1930, Partnership Act 1932, LLP Act 2008, and Companies Act 2013.',
    estimatedStudyHours: 130,
  },
  {
    id: 'paper3',
    paperNumber: 3,
    code: 'QA',
    name: 'Quantitative Aptitude',
    shortName: 'Quant',
    type: 'Objective',
    totalMarks: 100,
    passingMarks: 40,
    negativeMarking: 0.25,
    color: {
      primary: '#06B6D4', // Cyan
      light: '#CFFAFE',
      dark: '#155E75',
      accent: 'text-cyan-600 dark:text-cyan-400',
      border: 'border-cyan-500/30',
      glow: 'rgba(6, 182, 212, 0.2)',
      bg: 'bg-cyan-50 text-cyan-700 border-cyan-200',
      darkBg: 'dark:bg-cyan-950/50 dark:text-cyan-300 dark:border-cyan-800',
    },
    icon: 'Calculator',
    description:
      'Business Mathematics (40 Marks), Logical Reasoning (20 Marks), and Statistics (40 Marks) with -0.25 negative marking.',
    estimatedStudyHours: 160,
  },
  {
    id: 'paper4',
    paperNumber: 4,
    code: 'BECO',
    name: 'Business Economics',
    shortName: 'Economics',
    type: 'Objective',
    totalMarks: 100,
    passingMarks: 40,
    negativeMarking: 0.25,
    color: {
      primary: '#F59E0B', // Amber
      light: '#FEF3C7',
      dark: '#92400E',
      accent: 'text-amber-600 dark:text-amber-400',
      border: 'border-amber-500/30',
      glow: 'rgba(245, 158, 11, 0.2)',
      bg: 'bg-amber-50 text-amber-700 border-amber-200',
      darkBg: 'dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800',
    },
    icon: 'TrendingUp',
    description:
      'Microeconomics, Demand and Supply, Production and Cost, Market Price Determination, National Income, Public Finance, and Money Market.',
    estimatedStudyHours: 140,
  },
];

export const SUBJECT_METADATA_MAP: Record<SubjectId, SubjectMeta> = {
  paper1: SUBJECT_METADATA[0],
  paper2: SUBJECT_METADATA[1],
  paper3: SUBJECT_METADATA[2],
  paper4: SUBJECT_METADATA[3],
};

export const DEFAULT_USER_SETTINGS: UserSettings = {
  userName: 'Aspirant',
  examDate: '2026-11-01',
  dailyGoalHours: 6.0,
  theme: 'system',
  soundEnabled: true,
  confettiEnabled: true,
  autoScheduleRevisions: true,
  defaultRevisionIntervals: {
    low: 3,
    medium: 7,
    high: 14,
  },
  syllabusVersion: '2024.1-New-Scheme',
  lastSyncedAt: '',
};

export const NAV_ITEMS: NavigationItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: 'LayoutDashboard' },
  { id: 'schedule', label: 'Schedule', icon: 'Calendar' },
  { id: 'checklist', label: 'Checklist', icon: 'CheckSquare' },
  { id: 'lectures', label: 'Lectures', icon: 'Film' },
  { id: 'tests', label: 'Test Series', icon: 'FileSpreadsheet' },
  { id: 'revisions', label: 'Revisions', icon: 'RotateCw' },
  { id: 'ingestion', label: 'Ingestion Hub', icon: 'FolderSync' },
  { id: 'settings', label: 'Settings', icon: 'Settings' },
];

export const STORAGE_KEYS = {
  TOPICS: 'ca_tracker_topics',
  SCHEDULE: 'ca_tracker_schedule',
  REVISIONS: 'ca_tracker_revisions',
  TESTS: 'ca_tracker_tests',
  SETTINGS: 'ca_tracker_settings',
  THEME: 'ca_theme',
  STREAK: 'ca_tracker_streak',
};
