import blueprintRaw from '@/data/syllabus_blueprint.json';
import accountsLecturesRaw from '@/data/accounts_lectures.json';
import lawLecturesRaw from '@/data/law_lectures.json';
import ecoLecturesRaw from '@/data/eco_lectures.json';
import defaultScheduleRaw from '@/data/default_schedule.json';
import {
  SubjectId,
  SubjectMeta,
  Topic,
  Chapter,
  RevisionRecord,
  TestRecord,
  UserSettings,
  DashboardMetrics,
  SubjectProgressMetric,
  ActionPlanItem,
  SubjectGroup,
  Lecture,
  ScheduleEntry,
} from '@/types';
import { SUBJECT_METADATA, SUBJECT_METADATA_MAP } from '@/lib/constants';
import { calculatePercentage, getDaysRemaining, getTodayDateString } from '@/lib/utils';

/**
 * Raw blueprint typing matching `syllabus_blueprint.json`
 */
interface RawTopic {
  id: string;
  topicNumber?: number;
  unitNumber?: number;
  isUnit?: boolean;
  title: string;
  estimatedMinutes: number;
  learningObjectives?: string[];
  hasPracticalProblems?: boolean;
  hasTheoryQuestions?: boolean;
  revisionCycleDefaultDays?: number[];
  notes?: string;
  pdfUrl?: string;
  pdfTitle?: string;
  videoUrl?: string;
  videoTitle?: string;
}

interface RawChapter {
  id: string;
  chapterNumber: number;
  title: string;
  hasSubunits?: boolean;
  partId?: string;
  partName?: string;
  icaiWeightage?: {
    minPercentage: number;
    maxPercentage: number;
    typicalMarks: string;
  };
  estimatedStudyHours: number;
  difficulty?: 'Easy' | 'Medium' | 'Hard';
  importance?: 'Low' | 'Medium' | 'High' | 'Essential';
  description?: string;
  pdfUrl?: string;
  pdfTitle?: string;
  videoUrl?: string;
  videoTitle?: string;
  topics: RawTopic[];
}

interface RawSubject {
  id: string; // 'paper-1-accounting' | 'paper-2-business-laws' | 'paper-3-quantitative-aptitude' | 'paper-4-business-economics'
  paperNumber: 1 | 2 | 3 | 4;
  code: string;
  title: string;
  shortTitle: string;
  type: 'Descriptive' | 'Objective';
  totalMarks: number;
  estimatedStudyHours: number;
  chapters: RawChapter[];
}

interface RawBlueprint {
  id: string;
  version: string;
  totalPapers: number;
  totalMarks: number;
  subjects: RawSubject[];
}

const blueprint = blueprintRaw as unknown as RawBlueprint;

/**
 * Map raw subject ID to internal SubjectId enum
 */
export function normalizeSubjectId(rawId?: string | number | null): SubjectId {
  if (rawId === null || rawId === undefined) return 'paper1';
  if (typeof rawId === 'number') {
    switch (rawId) {
      case 1:
        return 'paper1';
      case 2:
        return 'paper2';
      case 3:
        return 'paper3';
      case 4:
        return 'paper4';
      default:
        return 'paper1';
    }
  }
  const lower = String(rawId).toLowerCase();
  if (lower.includes('paper-1') || lower.includes('paper1') || lower.includes('acc')) return 'paper1';
  if (lower.includes('paper-2') || lower.includes('paper2') || lower.includes('law')) return 'paper2';
  if (lower.includes('paper-3') || lower.includes('paper3') || lower.includes('qa') || lower.includes('quant')) return 'paper3';
  if (lower.includes('paper-4') || lower.includes('paper4') || lower.includes('eco')) return 'paper4';
  return 'paper1';
}

/**
 * Extract parsed chapters and topics from syllabus_blueprint.json
 */
export function loadSeedSyllabus(): {
  topics: Topic[];
  chapters: Chapter[];
  subjects: SubjectMeta[];
} {
  const topics: Topic[] = [];
  const chapters: Chapter[] = [];
  let globalOrder = 1;

  // Build lookup map of topic IDs to scheduled target dates
  const topicTargetDateMap = new Map<string, string>();
  for (const entry of defaultScheduleRaw as ScheduleEntry[]) {
    if (entry.topicIds && entry.date) {
      for (const tId of entry.topicIds) {
        if (!topicTargetDateMap.has(tId)) {
          topicTargetDateMap.set(tId, entry.date);
        }
      }
    }
  }

  for (const rawSub of blueprint.subjects) {
    const subjectId = normalizeSubjectId(rawSub.id || rawSub.paperNumber);

    for (const rawCh of rawSub.chapters) {
      const chapterTopics: Topic[] = [];

      for (const rawTop of rawCh.topics) {
        const estMinutes = rawTop.estimatedMinutes || 60;
        const targetDate = topicTargetDateMap.get(rawTop.id);
        const topic: Topic = {
          id: rawTop.id,
          subjectId,
          chapterId: rawCh.id,
          chapterName: rawCh.title,
          topicNumber: rawTop.topicNumber,
          unitNumber: rawTop.unitNumber,
          isUnit: rawTop.isUnit ?? Boolean(rawTop.unitNumber || (rawCh.hasSubunits && rawCh.topics.length > 1)),
          title: rawTop.title,
          status: 'pending',
          estimatedMinutes: estMinutes,
          estimatedHours: Number((estMinutes / 60).toFixed(1)),
          targetDate,
          order: globalOrder++,
          isCustom: false,
          learningObjectives: rawTop.learningObjectives || [],
          hasPracticalProblems: rawTop.hasPracticalProblems ?? false,
          hasTheoryQuestions: rawTop.hasTheoryQuestions ?? true,
          revisionCycleDefaultDays: rawTop.revisionCycleDefaultDays || [1, 7, 21, 45],
          notes: rawTop.notes,
          pdfUrl: rawTop.pdfUrl || rawCh.pdfUrl,
          pdfTitle: rawTop.pdfTitle || rawCh.pdfTitle || `${rawCh.title} - ${rawTop.title}`,
          videoUrl: rawTop.videoUrl || rawCh.videoUrl,
          videoTitle: rawTop.videoTitle || rawCh.videoTitle,
        };

        topics.push(topic);
        chapterTopics.push(topic);
      }

      chapters.push({
        id: rawCh.id,
        subjectId,
        chapterNumber: rawCh.chapterNumber,
        title: rawCh.title,
        hasSubunits: rawCh.hasSubunits ?? (chapterTopics.length > 1),
        partId: rawCh.partId,
        partName: rawCh.partName,
        icaiWeightage: rawCh.icaiWeightage,
        estimatedStudyHours: rawCh.estimatedStudyHours || 10,
        difficulty: rawCh.difficulty,
        importance: rawCh.importance,
        description: rawCh.description,
        pdfUrl: rawCh.pdfUrl,
        pdfTitle: rawCh.pdfTitle || rawCh.title,
        videoUrl: rawCh.videoUrl,
        videoTitle: rawCh.videoTitle,
        topics: chapterTopics,
        totalTopicsCount: chapterTopics.length,
        completedTopicsCount: 0,
        progressPercentage: 0,
      });
    }
  }

  return {
    topics,
    chapters,
    subjects: SUBJECT_METADATA,
  };
}

/**
 * Load seeded schedule strictly mapped from the handwritten notes
 */
export function loadSeedSchedule(): ScheduleEntry[] {
  return (defaultScheduleRaw as ScheduleEntry[]).map((entry) => ({
    ...entry,
    completed: Boolean(entry.completed),
  }));
}

/**
 * Load seeded Accounts, Business Laws, and Business Economics lectures
 */
export function loadSeedLectures(): Lecture[] {
  const accounts: Lecture[] = (accountsLecturesRaw as unknown as Lecture[]).map((lec) => ({
    ...lec,
    subjectId: normalizeSubjectId(lec.subjectId),
    watched: false,
  }));
  const law: Lecture[] = (lawLecturesRaw as unknown as Lecture[]).map((lec) => ({
    ...lec,
    subjectId: normalizeSubjectId(lec.subjectId),
    watched: false,
  }));
  const eco: Lecture[] = (ecoLecturesRaw as unknown as Lecture[]).map((lec) => ({
    ...lec,
    subjectId: normalizeSubjectId(lec.subjectId),
    watched: false,
  }));
  return [...accounts, ...law, ...eco];
}

/**
 * Group chapters and topics by subject with computed progress metrics
 */
export function buildSubjectGroups(
  topics: Topic[],
  chapters: Chapter[],
  subjects: SubjectMeta[] = SUBJECT_METADATA
): Record<SubjectId, SubjectGroup> {
  const groups: Partial<Record<SubjectId, SubjectGroup>> = {};

  for (const subject of subjects) {
    const subTopics = topics.filter((t) => t.subjectId === subject.id);
    const subChapters = chapters.filter((c) => c.subjectId === subject.id);

    const completedTopics = subTopics.filter((t) => t.status === 'completed').length;
    const inProgressTopics = subTopics.filter((t) => t.status === 'in_progress').length;
    const pendingTopics = subTopics.filter((t) => t.status === 'pending').length;
    const totalTopics = subTopics.length;

    const totalEstHours = subTopics.reduce((acc, t) => acc + (t.estimatedHours || 0), 0);
    const completedEstHours = subTopics
      .filter((t) => t.status === 'completed')
      .reduce((acc, t) => acc + (t.estimatedHours || 0), 0);

    const progressPercentage = calculatePercentage(completedTopics, totalTopics);

    // Build enriched chapters with updated counts
    const enrichedChapters: Chapter[] = subChapters.map((ch) => {
      const chTopics = subTopics.filter((t) => t.chapterId === ch.id);
      const chCompleted = chTopics.filter((t) => t.status === 'completed').length;
      return {
        ...ch,
        topics: chTopics,
        totalTopicsCount: chTopics.length,
        completedTopicsCount: chCompleted,
        progressPercentage: calculatePercentage(chCompleted, chTopics.length),
      };
    });

    // Check for any custom or new topics whose chapterId is not present in subChapters
    const existingChapterIds = new Set(subChapters.map((c) => c.id));
    const orphanedTopics = subTopics.filter((t) => !existingChapterIds.has(t.chapterId));

    if (orphanedTopics.length > 0) {
      // Group orphaned topics by chapterId
      const customChapterMap = new Map<string, Topic[]>();
      for (const t of orphanedTopics) {
        const cId = t.chapterId || `${subject.id}-custom`;
        const list = customChapterMap.get(cId) || [];
        list.push(t);
        customChapterMap.set(cId, list);
      }

      let dynamicChapterIdx = 1;
      for (const [chId, chTopics] of customChapterMap.entries()) {
        const firstTopic = chTopics[0];
        const chCompleted = chTopics.filter((t) => t.status === 'completed').length;
        const customChapter: Chapter = {
          id: chId,
          subjectId: subject.id,
          chapterNumber: subChapters.length + dynamicChapterIdx++,
          title: firstTopic?.chapterName || 'Custom Topics',
          estimatedStudyHours: Number(
            chTopics.reduce((acc, t) => acc + (t.estimatedHours || 0), 0).toFixed(1)
          ),
          topics: chTopics,
          totalTopicsCount: chTopics.length,
          completedTopicsCount: chCompleted,
          progressPercentage: calculatePercentage(chCompleted, chTopics.length),
          description: 'Custom topics and chapters added by user',
        };
        enrichedChapters.push(customChapter);
      }
    }

    groups[subject.id] = {
      meta: subject,
      chapters: enrichedChapters,
      totalTopics,
      completedTopics,
      inProgressTopics,
      pendingTopics,
      progressPercentage,
      totalEstimatedHours: Number(totalEstHours.toFixed(1)),
      completedEstimatedHours: Number(completedEstHours.toFixed(1)),
    };
  }

  return groups as Record<SubjectId, SubjectGroup>;
}

/**
 * Compute all dashboard metrics dynamically from live state
 */
export function calculateDashboardMetrics(
  topics: Topic[],
  tests: TestRecord[] = [],
  revisions: RevisionRecord[] = [],
  settings: UserSettings,
  schedule: ScheduleEntry[] = []
): DashboardMetrics {
  const totalTopics = topics.length;
  const completedTopics = topics.filter((t) => t.status === 'completed').length;
  const inProgressTopics = topics.filter((t) => t.status === 'in_progress').length;
  const pendingTopics = topics.filter((t) => t.status === 'pending').length;
  const overallProgressPercentage = calculatePercentage(completedTopics, totalTopics);

  const subjectProgress: Record<SubjectId, SubjectProgressMetric> = {
    paper1: computeSubjectMetric('paper1', topics),
    paper2: computeSubjectMetric('paper2', topics),
    paper3: computeSubjectMetric('paper3', topics),
    paper4: computeSubjectMetric('paper4', topics),
  };

  const daysUntilExam = getDaysRemaining(settings.examDate || '2026-11-01');

  // Study hours
  const totalStudyHoursLogged = Number(
    topics
      .filter((t) => t.status === 'completed')
      .reduce((sum, t) => sum + (t.estimatedHours || 0), 0)
      .toFixed(1)
  );

  // Today Action Items
  const actionItems = generateActionPlan(topics, revisions, tests, schedule);
  const todayActionItemsTotal = actionItems.length;
  const todayActionItemsCompleted = actionItems.filter((item) => item.isCompleted).length;

  // Tests metrics
  const totalTestsLogged = tests.length;
  const validTests = tests.filter(
    (t) => (t.totalMarks || 0) > 0 && !isNaN(t.percentage) && isFinite(t.percentage)
  );
  const recentTestsAveragePercentage =
    validTests.length > 0
      ? Number(
          (
            validTests.reduce((acc, t) => acc + (t.percentage || 0), 0) / validTests.length
          ).toFixed(1)
        )
      : 0;

  const totalRevisionsCompleted = revisions.length;

  // Passing likelihood projection based on ICAI rule (>=40% per subject and >=50% aggregate)
  let passingCount = 0;
  for (const sId of Object.keys(subjectProgress) as SubjectId[]) {
    if (subjectProgress[sId].percentage >= 40) {
      passingCount++;
    }
  }

  let aggregatePassingLikelihood: 'On Track' | 'Needs Attention' | 'At Risk' = 'At Risk';
  if (overallProgressPercentage >= 50 && passingCount === 4) {
    aggregatePassingLikelihood = 'On Track';
  } else if (overallProgressPercentage >= 30 || passingCount >= 2) {
    aggregatePassingLikelihood = 'Needs Attention';
  }

  // Calculate Streak
  const streak = calculateStreak(topics, revisions, tests);

  return {
    overallProgressPercentage,
    totalTopics,
    completedTopics,
    inProgressTopics,
    pendingTopics,
    subjectProgress,
    daysUntilExam,
    currentStreakDays: streak.currentStreak,
    bestStreakDays: streak.bestStreak,
    totalStudyHoursLogged,
    todayActionItemsTotal,
    todayActionItemsCompleted,
    recentTestsAveragePercentage,
    totalTestsLogged,
    totalRevisionsCompleted,
    aggregatePassingLikelihood,
  };
}

function computeSubjectMetric(subjectId: SubjectId, topics: Topic[]): SubjectProgressMetric {
  const meta = SUBJECT_METADATA_MAP[subjectId];
  const subTopics = topics.filter((t) => t.subjectId === subjectId);
  const total = subTopics.length;
  const completed = subTopics.filter((t) => t.status === 'completed').length;
  const inProgress = subTopics.filter((t) => t.status === 'in_progress').length;
  const pending = subTopics.filter((t) => t.status === 'pending').length;
  const percentage = calculatePercentage(completed, total);
  const totalEst = subTopics.reduce((acc, t) => acc + (t.estimatedHours || 0), 0);
  const compEst = subTopics
    .filter((t) => t.status === 'completed')
    .reduce((acc, t) => acc + (t.estimatedHours || 0), 0);

  return {
    subjectId,
    name: meta.name,
    shortName: meta.shortName,
    code: meta.code,
    paperNumber: meta.paperNumber,
    totalTopics: total,
    completedTopics: completed,
    inProgressTopics: inProgress,
    pendingTopics: pending,
    percentage,
    color: meta.color.primary,
    totalEstimatedHours: Number(totalEst.toFixed(1)),
    completedEstimatedHours: Number(compEst.toFixed(1)),
    isPassingProjected: percentage >= 40,
  };
}

/**
 * Generate Today's Action Plan items dynamically
 */
export function generateActionPlan(
  topics: Topic[],
  revisions: RevisionRecord[] = [],
  tests: TestRecord[] = [],
  schedule: ScheduleEntry[] = []
): ActionPlanItem[] {
  const today = getTodayDateString();
  const items: ActionPlanItem[] = [];

  // When a study schedule exists, Today's Action Plan is strictly governed by the current schedule
  const todayScheduleEntries = (schedule || []).filter((s) => s.date === today);
  const overdueScheduleEntries = (schedule || []).filter((s) => s.date < today && !s.completed);

  if (todayScheduleEntries.length > 0 || overdueScheduleEntries.length > 0) {
    const relevantSchedule = [...overdueScheduleEntries, ...todayScheduleEntries];
    for (const entry of relevantSchedule) {
      const isOverdue = entry.date < today && !entry.completed;

      // Calculate estimated minutes from mapped topics if available
      let estMinutes = 60;
      if (entry.topicIds && entry.topicIds.length > 0) {
        const mappedMinutes = topics
          .filter((t) => entry.topicIds!.includes(t.id))
          .reduce((sum, t) => sum + (t.estimatedMinutes || 60), 0);
        if (mappedMinutes > 0) {
          estMinutes = mappedMinutes;
        }
      } else if (entry.isRevision || entry.title.toLowerCase().startsWith('revision')) {
        estMinutes = 90;
      }

      const isRev = Boolean(entry.isRevision || entry.title.toLowerCase().startsWith('revision'));
      const subjectMeta = entry.subjectId ? SUBJECT_METADATA_MAP[entry.subjectId] : undefined;
      const subjectName = subjectMeta ? subjectMeta.shortName : (isRev ? 'Revision' : 'Comprehensive');

      items.push({
        id: `action-schedule-${entry.id}`,
        type: isRev ? 'revision' : 'schedule',
        title: entry.title,
        subjectId: entry.subjectId,
        subjectName,
        chapterName: entry.chapterName,
        dueDate: entry.date,
        isOverdue,
        isCompleted: Boolean(entry.completed),
        estimatedMinutes: estMinutes,
        priority: isOverdue ? 'high' : (isRev ? 'high' : 'medium'),
        scheduleEntryId: entry.id,
        topicIds: entry.topicIds,
        topicId: entry.topicIds && entry.topicIds.length > 0 ? entry.topicIds[0] : undefined,
        notes: entry.notes,
      });
    }

    // Sort: overdue first, then pending items, then completed items
    return items.sort((a, b) => {
      if (a.isOverdue && !b.isOverdue) return -1;
      if (!a.isOverdue && b.isOverdue) return 1;
      if (!a.isCompleted && b.isCompleted) return -1;
      if (a.isCompleted && !b.isCompleted) return 1;
      return 0;
    });
  }

  // Fallback if no active schedule exists for today: use standalone checklist topics and revisions
  for (const topic of topics) {
    if (topic.targetDate && topic.status !== 'completed') {
      const isOverdue = topic.targetDate < today;
      const isDueToday = topic.targetDate === today;
      if (isDueToday || isOverdue) {
        items.push({
          id: `action-topic-${topic.id}`,
          type: 'lesson',
          title: topic.title,
          subjectId: topic.subjectId,
          subjectName: SUBJECT_METADATA_MAP[topic.subjectId]?.shortName || 'Subject',
          chapterName: topic.chapterName,
          dueDate: topic.targetDate,
          isOverdue,
          isCompleted: false,
          estimatedMinutes: topic.estimatedMinutes || 60,
          priority: isOverdue ? 'high' : 'medium',
          topicId: topic.id,
          topicIds: [topic.id],
        });
      }
    }
  }

  // Scheduled revisions due today or overdue
  for (const rev of revisions) {
    if (rev.nextTargetDate) {
      const isOverdue = rev.nextTargetDate < today;
      const isDueToday = rev.nextTargetDate === today;
      if (isDueToday || isOverdue) {
        items.push({
          id: `action-rev-${rev.id}`,
          type: 'revision',
          title: `R${rev.cycle}: ${rev.topicTitle}`,
          subjectId: rev.subjectId,
          subjectName: SUBJECT_METADATA_MAP[rev.subjectId]?.shortName || 'Subject',
          chapterName: rev.chapterName,
          dueDate: rev.nextTargetDate,
          isOverdue,
          isCompleted: false,
          estimatedMinutes: 30,
          priority: isOverdue ? 'high' : 'normal',
          revisionId: rev.id,
          topicId: rev.topicId,
          cycle: rev.cycle,
        });
      }
    }
  }

  // Tests scheduled for today or overdue
  for (const test of tests) {
    if (test.dateAttempted === today) {
      items.push({
        id: `action-test-${test.id}`,
        type: 'test',
        title: test.title,
        subjectId: test.subjectId,
        subjectName: SUBJECT_METADATA_MAP[test.subjectId]?.shortName || 'Subject',
        dueDate: test.dateAttempted,
        isOverdue: false,
        isCompleted: true,
        estimatedMinutes: 60,
        priority: 'medium',
        testId: test.id,
      });
    }
  }

  return items.sort((a, b) => {
    if (a.isOverdue && !b.isOverdue) return -1;
    if (!a.isOverdue && b.isOverdue) return 1;
    if (!a.isCompleted && b.isCompleted) return -1;
    if (a.isCompleted && !b.isCompleted) return 1;
    return 0;
  });
}

/**
 * Calculate study streak from activity timestamps
 */
export function calculateStreak(
  topics: Topic[],
  revisions: RevisionRecord[] = [],
  tests: TestRecord[] = []
): { currentStreak: number; bestStreak: number } {
  const activeDates = new Set<string>();

  const addIfValid = (rawDate?: string | null) => {
    if (!rawDate || typeof rawDate !== 'string') return;
    const clean = rawDate.split('T')[0];
    const parts = clean.split('-');
    if (parts.length !== 3) return;
    const y = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10);
    const d = parseInt(parts[2], 10);
    if (isNaN(y) || isNaN(m) || isNaN(d) || y < 1900 || y > 2100 || m < 1 || m > 12 || d < 1 || d > 31) return;

    const parsed = new Date(y, m - 1, d);
    if (isNaN(parsed.getTime())) return;
    if (parsed.getFullYear() !== y || parsed.getMonth() !== m - 1 || parsed.getDate() !== d) return;

    const isoDate = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    activeDates.add(isoDate);
  };

  // Collect active dates from topic completions
  for (const t of topics || []) {
    if (t?.completedAt) addIfValid(t.completedAt);
    if (t?.startedAt) addIfValid(t.startedAt);
  }

  // Collect from revisions
  for (const r of revisions || []) {
    if (r?.lastRevisedDate) addIfValid(r.lastRevisedDate);
  }

  // Collect from tests
  for (const t of tests || []) {
    if (t?.dateAttempted) addIfValid(t.dateAttempted);
  }

  if (activeDates.size === 0) {
    return { currentStreak: 0, bestStreak: 0 };
  }

  const sortedDates = Array.from(activeDates).sort().reverse();
  const today = getTodayDateString();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yYear = yesterday.getFullYear();
  const yMonth = String(yesterday.getMonth() + 1).padStart(2, '0');
  const yDay = String(yesterday.getDate()).padStart(2, '0');
  const yesterdayStr = `${yYear}-${yMonth}-${yDay}`;

  // If latest active date is not today and not yesterday, current streak is 0
  const latestDate = sortedDates[0];
  let currentStreak = 0;

  if (latestDate === today || latestDate === yesterdayStr) {
    currentStreak = 1;
    const [ly, lm, ld] = latestDate.split('-').map(Number);
    let expectedPrev = new Date(ly, lm - 1, ld);

    for (let i = 1; i < sortedDates.length; i++) {
      expectedPrev.setDate(expectedPrev.getDate() - 1);
      const y = expectedPrev.getFullYear();
      const m = String(expectedPrev.getMonth() + 1).padStart(2, '0');
      const d = String(expectedPrev.getDate()).padStart(2, '0');
      const expectedStr = `${y}-${m}-${d}`;

      if (sortedDates[i] === expectedStr) {
        currentStreak++;
      } else {
        break;
      }
    }
  }

  // Calculate best streak across full history
  const chronoSorted = Array.from(activeDates).sort();
  let maxStreak = 1;
  let tempStreak = 1;

  for (let i = 1; i < chronoSorted.length; i++) {
    const [prevY, prevM, prevD] = chronoSorted[i - 1].split('-').map(Number);
    const prev = new Date(prevY, prevM - 1, prevD);
    prev.setDate(prev.getDate() + 1);
    const y = prev.getFullYear();
    const m = String(prev.getMonth() + 1).padStart(2, '0');
    const d = String(prev.getDate()).padStart(2, '0');
    const expected = `${y}-${m}-${d}`;

    if (chronoSorted[i] === expected) {
      tempStreak++;
      if (tempStreak > maxStreak) maxStreak = tempStreak;
    } else {
      tempStreak = 1;
    }
  }

  return {
    currentStreak,
    bestStreak: Math.max(currentStreak, maxStreak),
  };
}
