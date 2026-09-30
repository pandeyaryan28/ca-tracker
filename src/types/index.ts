/**
 * CA Foundation Exam Preparation Tracker - Core Domain Types
 * Authoritative Schema for ICAI New Scheme (4 Papers, 46 Chapters, 99 Units/Topics - May 2026 Onwards)
 */

// ============================================================================
// 1. SUBJECT & SYLLABUS DOMAIN TYPES
// ============================================================================

export type SubjectId = 'paper1' | 'paper2' | 'paper3' | 'paper4';

export type SubjectPaperType = 'Descriptive' | 'Objective';

export interface SubjectColorConfig {
  primary: string;
  light: string;
  dark: string;
  accent: string;
  border: string;
  glow?: string;
  bg?: string;
  darkBg?: string;
}

export interface SubjectMeta {
  id: SubjectId;
  paperNumber: 1 | 2 | 3 | 4;
  code: string; // 'ACC' | 'BLAW' | 'QA' | 'BECO'
  name: string; // e.g. 'Accounting', 'Business Laws', etc.
  shortName: string; // 'Accounts', 'Law', 'Quant', 'Economics'
  type: SubjectPaperType;
  totalMarks: number; // 100
  passingMarks: number; // 40 (40%)
  negativeMarking: number; // 0.0 for Papers 1 & 2; 0.25 for Papers 3 & 4
  color: SubjectColorConfig;
  icon: string; // Lucide icon identifier e.g. 'Calculator', 'Scale', 'Sigma', 'TrendingUp'
  description: string;
  estimatedStudyHours: number;
}

export type TopicStatus = 'pending' | 'in_progress' | 'completed';

export interface Topic {
  id: string; // e.g. 'acc-top-0101' or custom UUID
  subjectId: SubjectId; // 'paper1' | 'paper2' | 'paper3' | 'paper4'
  chapterId: string; // e.g. 'acc-ch-01'
  chapterName: string; // e.g. 'Theoretical Framework'
  topicNumber?: number; // 1, 2, ...
  unitNumber?: number; // 1, 2, ... for official ICAI units
  isUnit?: boolean; // true for official ICAI unit, false for standalone chapter
  title: string; // e.g. 'Meaning and Scope of Accounting'
  status: TopicStatus; // 'pending' | 'in_progress' | 'completed'
  estimatedMinutes?: number; // e.g. 60
  estimatedHours?: number; // computed or manual, e.g. 1.0
  targetDate?: string; // YYYY-MM-DD
  startedAt?: string; // ISO 8601 string
  completedAt?: string; // ISO 8601 string
  order: number; // Global or chapter-level display sequence index
  isCustom?: boolean; // true if created by user, false for blueprint defaults
  learningObjectives?: string[];
  hasPracticalProblems?: boolean;
  hasTheoryQuestions?: boolean;
  revisionCycleDefaultDays?: number[]; // [1, 7, 21, 45]
  notes?: string;
  pdfUrl?: string; // Direct link to official ICAI study material module/chapter/unit PDF
  pdfTitle?: string; // Descriptive title for the PDF resource
  videoUrl?: string; // Direct link to official YouTube lecture
  videoTitle?: string; // Descriptive title for the YouTube lecture
}

export interface Chapter {
  id: string; // e.g. 'acc-ch-01'
  subjectId: SubjectId;
  chapterNumber: number;
  title: string;
  hasSubunits?: boolean; // true if chapter contains official ICAI units; false if standalone chapter
  partId?: string; // e.g. 'part-a', 'part-b', 'part-c' (for QA Part A/B/C)
  partName?: string; // e.g. 'Business Mathematics', 'Logical Reasoning', 'Statistics'
  icaiWeightage?: {
    minPercentage: number;
    maxPercentage: number;
    typicalMarks: string;
  };
  estimatedStudyHours: number;
  difficulty?: 'Easy' | 'Medium' | 'Hard';
  importance?: 'Low' | 'Medium' | 'High' | 'Essential';
  description?: string;
  pdfUrl?: string; // Direct link to official ICAI chapter PDF
  pdfTitle?: string;
  videoUrl?: string; // Direct link to official YouTube lecture
  videoTitle?: string;
  topics: Topic[];
  // Aggregated / Computed fields for UI grouping:
  completedTopicsCount?: number;
  totalTopicsCount?: number;
  progressPercentage?: number;
}

export interface SubjectSyllabus {
  subject: SubjectMeta;
  chapters: Chapter[];
}

export interface SubjectGroup {
  meta: SubjectMeta;
  chapters: Chapter[];
  totalTopics: number;
  completedTopics: number;
  inProgressTopics: number;
  pendingTopics: number;
  progressPercentage: number;
  totalEstimatedHours: number;
  completedEstimatedHours: number;
}

// ============================================================================
// 2. TEST SERIES & PERFORMANCE LOGGER TYPES
// ============================================================================

export type TestType = 'chapter' | 'unit' | 'mock';

export interface TestRecord {
  id: string; // UUID
  title: string; // e.g. 'Ch 1-4 Diagnostic Unit Test'
  subjectId: SubjectId; // 'paper1' | 'paper2' | 'paper3' | 'paper4'
  testType: TestType; // 'chapter' | 'unit' | 'mock'
  chapterId?: string; // Optional if chapter-specific
  dateAttempted: string; // YYYY-MM-DD
  marksObtained: number; // e.g. 74.5
  totalMarks: number; // e.g. 100
  percentage: number; // Computed: (marksObtained / totalMarks) * 100
  isPassed: boolean; // Computed: percentage >= 40.0
  negativeMarksDeducted?: number; // For Papers 3 & 4
  timeTakenMinutes?: number; // Duration of test
  notes?: string; // General feedback / observations
  weakTopics?: string[]; // Array of topic IDs or topic titles flagged as weak
  createdAt: string; // ISO 8601 timestamp
  updatedAt?: string; // ISO 8601 timestamp
}

// ============================================================================
// 3. MULTI-STAGE SPACED REVISION TYPES
// ============================================================================

export type ConfidenceLevel = 'low' | 'medium' | 'high';

export interface RevisionRecord {
  id: string; // UUID or `${topicId}_r${cycle}`
  topicId: string;
  topicTitle: string;
  chapterId?: string;
  chapterName?: string;
  subjectId: SubjectId;
  cycle: number; // 1 = R1, 2 = R2, 3 = R3, 4 = R4+
  lastRevisedDate: string; // YYYY-MM-DD
  nextTargetDate: string; // YYYY-MM-DD
  confidence: ConfidenceLevel; // 'low' | 'medium' | 'high'
  mistakesNotes?: string; // Mistake notebook annotations
  keyFormulasReviewed?: boolean;
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
}

// ============================================================================
// 4. USER SETTINGS & APP PREFERENCES
// ============================================================================

export type AppTheme = 'dark' | 'light' | 'system';

export interface SpacedIntervalsConfig {
  low: number; // Default +3 days
  medium: number; // Default +7 days
  high: number; // Default +14 days
}

export interface UserSettings {
  userName?: string;
  examDate: string; // YYYY-MM-DD (e.g. '2026-11-01')
  dailyGoalHours: number; // e.g. 6.0
  theme: AppTheme;
  soundEnabled: boolean;
  confettiEnabled: boolean;
  autoScheduleRevisions: boolean; // Auto-create next revision cycle on completion
  defaultRevisionIntervals: SpacedIntervalsConfig;
  syllabusVersion: string; // '2024.1-New-Scheme'
  lastSyncedAt?: string; // ISO 8601
}

// ============================================================================
// 5. TODAY'S ACTION PLAN & DASHBOARD METRICS
// ============================================================================

export type ActionPlanItemType = 'lesson' | 'revision' | 'test' | 'schedule';

export interface ActionPlanItem {
  id: string; // Unique action plan item identifier
  type: ActionPlanItemType;
  title: string;
  subjectId?: SubjectId;
  subjectName: string;
  chapterName?: string;
  dueDate: string; // YYYY-MM-DD
  isOverdue: boolean;
  isCompleted: boolean;
  estimatedMinutes: number;
  priority: 'high' | 'medium' | 'normal';
  // Foreign identifiers for direct 1-tap state mutation:
  topicId?: string;
  topicIds?: string[];
  scheduleEntryId?: string;
  revisionId?: string;
  testId?: string;
  cycle?: number;
  notes?: string;
}

export interface SubjectProgressMetric {
  subjectId: SubjectId;
  name: string;
  shortName: string;
  code: string;
  paperNumber: number;
  totalTopics: number;
  completedTopics: number;
  inProgressTopics: number;
  pendingTopics: number;
  percentage: number;
  color: string;
  totalEstimatedHours: number;
  completedEstimatedHours: number;
  isPassingProjected: boolean;
}

export interface DashboardMetrics {
  overallProgressPercentage: number;
  totalTopics: number;
  completedTopics: number;
  inProgressTopics: number;
  pendingTopics: number;
  subjectProgress: Record<SubjectId, SubjectProgressMetric>;
  daysUntilExam: number;
  currentStreakDays: number;
  bestStreakDays: number;
  totalStudyHoursLogged: number;
  todayActionItemsTotal: number;
  todayActionItemsCompleted: number;
  recentTestsAveragePercentage: number;
  totalTestsLogged: number;
  totalRevisionsCompleted: number;
  aggregatePassingLikelihood: 'On Track' | 'Needs Attention' | 'At Risk';
}

// ============================================================================
// 6. NAVIGATION & SHELL INTERFACES
// ============================================================================

export type NavigationTab =
  | 'dashboard'
  | 'schedule'
  | 'checklist'
  | 'lectures'
  | 'tests'
  | 'revisions'
  | 'ingestion'
  | 'settings';

export interface NavigationItem {
  id: NavigationTab;
  label: string;
  icon: string;
  badge?: number | string;
}

export interface ScheduleEntry {
  id: string; // e.g. 'sch-0901'
  date: string; // YYYY-MM-DD e.g. '2026-09-09'
  displayDate: string; // e.g. '9 Sept'
  title: string; // e.g. 'P&C complete, ch-5'
  subjectId?: SubjectId; // 'paper1' | 'paper2' | 'paper3' | 'paper4'
  chapterId?: string; // e.g. 'qa-ch-05'
  chapterName?: string; // e.g. 'Permutations and Combinations'
  topicIds?: string[]; // mapped topic IDs from syllabus
  isRevision?: boolean; // true for Revision days
  completed: boolean;
  completedAt?: string;
  notes?: string;
  order: number;
}

export interface Lecture {
  id: string; // e.g. 'lec-acc-01'
  order: number; // 1 to 19
  title: string;
  uploadDate: string; // ISO 8601 string e.g. '2022-10-15T09:57:17Z'
  videoUrl: string; // YouTube URL
  youtubeId: string; // YouTube video ID
  curriculumMapping: string; // Curriculum Chapter / Unit text from sheet
  chapterId?: string; // Mapped syllabus chapter ID
  topicId?: string; // Mapped syllabus topic ID
  subjectId: SubjectId; // 'paper-1-accounting'
  watched: boolean;
  watchedAt?: string; // ISO string when marked watched
  notes?: string;
  duration?: string;
}

// ============================================================================
// 7. IMPORT / EXPORT & SYLLABUS SEED PAYLOADS
// ============================================================================

export type ImportConflictResolution = 'merge' | 'overwrite' | 'skip';

export interface ImportExportPayload {
  version: string; // e.g. '1.0'
  appVersion: string;
  exportedAt: string; // ISO 8601 timestamp
  settings: UserSettings;
  topics: Topic[];
  revisions: RevisionRecord[];
  tests: TestRecord[];
  lectures?: Lecture[];
  schedule?: ScheduleEntry[];
  customChapters?: Chapter[];
  metadata?: {
    totalTopics: number;
    completedTopics: number;
    totalTests: number;
    totalRevisions: number;
    totalLectures?: number;
    totalScheduleEntries?: number;
    schemaChecksum?: string;
  };
}

export interface ResetSyllabusOptions {
  preserveCustomTopics?: boolean;
  preserveTests?: boolean;
  preserveRevisions?: boolean;
  preserveSettings?: boolean;
  preserveLectures?: boolean;
  preserveSchedule?: boolean;
}

// ============================================================================
// 8. CORE DATA CONTEXT & STATE REDUCER CONTRACTS
// ============================================================================

export interface DataState {
  topics: Topic[];
  revisions: RevisionRecord[];
  tests: TestRecord[];
  lectures: Lecture[];
  schedule: ScheduleEntry[];
  settings: UserSettings;
  subjects: SubjectMeta[];
  chapters: Chapter[];
  isLoading: boolean;
  isSyncing: boolean;
  isCloudConnected?: boolean;
  error: string | null;
  lastSyncedAt: string | null;
}

export type DataAction =
  | { type: 'INITIALIZE_STATE'; payload: { topics: Topic[]; revisions: RevisionRecord[]; tests: TestRecord[]; lectures?: Lecture[]; schedule?: ScheduleEntry[]; settings: UserSettings } }
  | { type: 'SET_TOPICS'; payload: Topic[] }
  | { type: 'UPDATE_TOPIC_STATUS'; payload: { topicId: string; status: TopicStatus; customDate?: string } }
  | { type: 'BATCH_UPDATE_TOPIC_STATUS'; payload: { topicIds: string[]; status: TopicStatus; customDate?: string } }
  | { type: 'UPDATE_TOPIC'; payload: { topicId: string; updates: Partial<Topic> } }
  | { type: 'ADD_TOPIC'; payload: Topic }
  | { type: 'DELETE_TOPIC'; payload: { topicId: string } }
  | { type: 'SET_TESTS'; payload: TestRecord[] }
  | { type: 'ADD_TEST'; payload: TestRecord }
  | { type: 'UPDATE_TEST'; payload: { testId: string; updates: Partial<TestRecord> } }
  | { type: 'DELETE_TEST'; payload: { testId: string } }
  | { type: 'SET_REVISIONS'; payload: RevisionRecord[] }
  | { type: 'ADD_REVISION'; payload: RevisionRecord }
  | { type: 'UPDATE_REVISION'; payload: { revisionId: string; updates: Partial<RevisionRecord> } }
  | { type: 'ADVANCE_REVISION_CYCLE'; payload: { topicId: string; confidence: ConfidenceLevel; mistakesNotes?: string } }
  | { type: 'DELETE_REVISION'; payload: { revisionId: string } }
  | { type: 'SET_LECTURES'; payload: Lecture[] }
  | { type: 'TOGGLE_LECTURE_WATCHED'; payload: { lectureId: string; watched?: boolean } }
  | { type: 'SET_SCHEDULE'; payload: ScheduleEntry[] }
  | { type: 'TOGGLE_SCHEDULE_ENTRY'; payload: { entryId: string; completed?: boolean } }
  | { type: 'ADD_SCHEDULE_ENTRY'; payload: ScheduleEntry }
  | { type: 'UPDATE_SCHEDULE_ENTRY'; payload: { entryId: string; updates: Partial<ScheduleEntry> } }
  | { type: 'DELETE_SCHEDULE_ENTRY'; payload: { entryId: string } }
  | { type: 'UPDATE_SETTINGS'; payload: Partial<UserSettings> }
  | { type: 'RESET_SYLLABUS'; payload: { defaultTopics: Topic[]; options?: ResetSyllabusOptions } }
  | { type: 'IMPORT_DATA'; payload: { data: ImportExportPayload; mode: ImportConflictResolution } }
  | { type: 'SET_SYNCING'; payload: boolean }
  | { type: 'SET_CLOUD_CONNECTED'; payload: boolean }
  | { type: 'SET_LAST_SYNCED'; payload: string }
  | { type: 'SET_ERROR'; payload: string | null };

export interface DataContextValue {
  // State slices
  topics: Topic[];
  revisions: RevisionRecord[];
  tests: TestRecord[];
  lectures: Lecture[];
  schedule: ScheduleEntry[];
  settings: UserSettings;
  subjects: SubjectMeta[];
  chapters: Chapter[];
  
  // Computed views & metrics
  metrics: DashboardMetrics;
  actionPlan: ActionPlanItem[];
  subjectGroups: Record<SubjectId, SubjectGroup>;
  
  // Status flags
  isLoading: boolean;
  isSyncing: boolean;
  isCloudConnected?: boolean;
  lastSyncedAt?: string | null;
  error: string | null;

  // Cloud sync operation
  syncWithCloud?: () => Promise<void>;

  // Topic CRUD Operations
  setTopics: (topics: Topic[]) => void;
  updateTopicStatus: (topicId: string, status: TopicStatus, customDate?: string) => void;
  batchUpdateTopicStatus?: (topicIds: string[], status: TopicStatus, customDate?: string) => Promise<void>;
  updateTopic: (topicId: string, updates: Partial<Topic>) => void;
  addTopic: (topic: Omit<Topic, 'id' | 'order'> & { id?: string }) => void;
  deleteTopic: (topicId: string) => void;

  // Test Series Operations
  addTest: (testData: Omit<TestRecord, 'id' | 'percentage' | 'isPassed' | 'createdAt'>) => void;
  updateTest: (testId: string, updates: Partial<TestRecord>) => void;
  deleteTest: (testId: string) => void;

  // Revision Operations
  addRevision: (revision: Omit<RevisionRecord, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateRevision: (revisionId: string, updates: Partial<RevisionRecord>) => void;
  advanceRevisionCycle: (topicId: string, confidence: ConfidenceLevel, mistakesNotes?: string) => void;
  deleteRevision: (revisionId: string) => void;

  // Lecture Operations
  toggleLectureWatched: (lectureId: string, watched?: boolean) => Promise<void>;

  // Schedule Operations
  setSchedule: (entries: ScheduleEntry[]) => void;
  toggleScheduleEntry: (entryId: string, completed?: boolean) => void;
  addScheduleEntry: (entry: Omit<ScheduleEntry, 'id' | 'order'> & { id?: string }) => void;
  updateScheduleEntry: (entryId: string, updates: Partial<ScheduleEntry>) => void;
  deleteScheduleEntry: (entryId: string) => void;

  // Settings & Administrative Operations
  updateSettings: (updates: Partial<UserSettings>) => Promise<void> | void;
  resetToDefaultSyllabus: (options?: ResetSyllabusOptions) => void;
  importData: (payload: ImportExportPayload, mode: ImportConflictResolution) => void;
  exportData: (format?: 'json' | 'csv') => string;
}

