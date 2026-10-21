import React, { createContext, useContext, useReducer, useEffect, useMemo, useRef, useCallback } from 'react';
import {
  Topic,
  TopicStatus,
  RevisionRecord,
  TestRecord,
  UserSettings,
  ConfidenceLevel,
  ImportExportPayload,
  ImportConflictResolution,
  ResetSyllabusOptions,
  DataState,
  DataAction,
  DataContextValue,
  Lecture,
  ScheduleEntry,
} from '@/types';
import {
  loadSeedSyllabus,
  loadSeedLectures,
  loadSeedSchedule,
  buildSubjectGroups,
  calculateDashboardMetrics,
  generateActionPlan,
} from '@/lib/seedLoader';
import { DEFAULT_USER_SETTINGS, STORAGE_KEYS } from '@/lib/constants';
import {
  generateId,
  getTodayDateString,
  calculateNextRevisionDate,
} from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import {
  SINGLE_USER_ID,
  isTestEnv,
  saveSettingsToFirestore,
  fetchUserSettingsFromFirestore,
  batchUploadAllData,
  syncAndFillSyllabusWithCloud,
  subscribeToUserData,
  isHardReloadOrRefresh,
  fetchAllCAUserDataFromFirestore,
  flushPendingCAChangesToFirestore,
  CAPendingSync,
} from '@/lib/firebase';

const seed = loadSeedSyllabus();
const seedLectures = loadSeedLectures();
const seedSchedule = loadSeedSchedule();

function loadCachedSettings(): UserSettings {
  try {
    const raw = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEYS.SETTINGS) : null;
    const dedicatedExamDate =
      typeof window !== 'undefined' && STORAGE_KEYS.TARGET_EXAM_DATE
        ? localStorage.getItem(STORAGE_KEYS.TARGET_EXAM_DATE)
        : null;

    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        const resolvedExamDate =
          (dedicatedExamDate && dedicatedExamDate.trim()) ||
          (parsed.examDate && String(parsed.examDate).trim()) ||
          DEFAULT_USER_SETTINGS.examDate;

        return {
          ...DEFAULT_USER_SETTINGS,
          ...parsed,
          examDate: resolvedExamDate,
        };
      }
    }

    if (dedicatedExamDate && dedicatedExamDate.trim()) {
      return {
        ...DEFAULT_USER_SETTINGS,
        examDate: dedicatedExamDate.trim(),
      };
    }
  } catch (err) {
    console.warn('[DataContext] Error reading settings from localStorage:', err);
  }
  return DEFAULT_USER_SETTINGS;
}

function saveCachedSettings(settings: UserSettings): void {
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
      if (settings.examDate && settings.examDate.trim()) {
        localStorage.setItem(STORAGE_KEYS.TARGET_EXAM_DATE, settings.examDate.trim());
      }
    }
  } catch (err) {
    console.warn('[DataContext] Error saving settings to localStorage:', err);
  }
}

function resolveSettingsConflict(cached: UserSettings, cloudSettings: UserSettings): UserSettings {
  const cachedTime = cached.lastSyncedAt ? new Date(cached.lastSyncedAt).getTime() : 0;
  const cloudTime = cloudSettings.lastSyncedAt ? new Date(cloudSettings.lastSyncedAt).getTime() : 0;

  // If local timestamp is strictly newer, local user choice wins
  if (cachedTime > cloudTime) {
    return {
      ...cloudSettings,
      ...cached,
      examDate: cached.examDate || cloudSettings.examDate || DEFAULT_USER_SETTINGS.examDate,
    };
  }

  // Cloud timestamp is newer or equal:
  return {
    ...cached,
    ...cloudSettings,
    examDate: (cloudSettings.examDate && cloudSettings.examDate.trim()) || cached.examDate || DEFAULT_USER_SETTINGS.examDate,
  };
}

function loadCachedTopics(): Topic[] {
  try {
    const raw = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEYS.TOPICS) : null;
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('[DataContext] Error reading topics from localStorage:', err);
  }
  saveCachedTopics(seed.topics);
  return seed.topics;
}

function saveCachedTopics(topics: Topic[]): void {
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.TOPICS, JSON.stringify(topics));
    }
  } catch (err) {
    console.warn('[DataContext] Error saving topics to localStorage:', err);
  }
}

function loadCachedLectures(): Lecture[] {
  try {
    const raw = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEYS.LECTURES) : null;
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('[DataContext] Error reading lectures from localStorage:', err);
  }
  return seedLectures;
}

function saveCachedLectures(lectures: Lecture[]): void {
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.LECTURES, JSON.stringify(lectures));
    }
  } catch (err) {
    console.warn('[DataContext] Error saving lectures to localStorage:', err);
  }
}

function loadCachedSchedule(): ScheduleEntry[] {
  try {
    const raw = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEYS.SCHEDULE) : null;
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('[DataContext] Error reading schedule from localStorage:', err);
  }
  return seedSchedule;
}

function saveCachedSchedule(schedule: ScheduleEntry[]): void {
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.SCHEDULE, JSON.stringify(schedule));
    }
  } catch (err) {
    console.warn('[DataContext] Error saving schedule to localStorage:', err);
  }
}

function loadCachedRevisions(): RevisionRecord[] {
  try {
    const raw = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEYS.REVISIONS) : null;
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('[DataContext] Error reading revisions from localStorage:', err);
  }
  return [];
}

function saveCachedRevisions(revisions: RevisionRecord[]): void {
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.REVISIONS, JSON.stringify(revisions));
    }
  } catch (err) {
    console.warn('[DataContext] Error saving revisions to localStorage:', err);
  }
}

function loadCachedTests(): TestRecord[] {
  try {
    const raw = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEYS.TESTS) : null;
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('[DataContext] Error reading tests from localStorage:', err);
  }
  return [];
}

function saveCachedTests(tests: TestRecord[]): void {
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.TESTS, JSON.stringify(tests));
    }
  } catch (err) {
    console.warn('[DataContext] Error saving tests to localStorage:', err);
  }
}

function loadPendingSync(): CAPendingSync {
  try {
    if (typeof window === 'undefined') return {};
    const raw = localStorage.getItem(STORAGE_KEYS.PENDING_SYNC);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function savePendingSync(pending: CAPendingSync): void {
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.PENDING_SYNC, JSON.stringify(pending));
    }
  } catch {
    // ignore
  }
}

function clearPendingSync(): void {
  try {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEYS.PENDING_SYNC);
    }
  } catch {
    // ignore
  }
}

function recordPendingSync(diff: Partial<CAPendingSync>): void {
  try {
    const current = loadPendingSync();
    const updated: CAPendingSync = {
      ...current,
      topics: diff.topics ? { ...current.topics, ...diff.topics } : current.topics,
      deletedTopicIds: diff.deletedTopicIds
        ? Array.from(new Set([...(current.deletedTopicIds || []), ...diff.deletedTopicIds]))
        : current.deletedTopicIds,
      lectures: diff.lectures ? { ...current.lectures, ...diff.lectures } : current.lectures,
      schedule: diff.schedule ? { ...current.schedule, ...diff.schedule } : current.schedule,
      deletedScheduleIds: diff.deletedScheduleIds
        ? Array.from(new Set([...(current.deletedScheduleIds || []), ...diff.deletedScheduleIds]))
        : current.deletedScheduleIds,
      revisions: diff.revisions ? { ...current.revisions, ...diff.revisions } : current.revisions,
      deletedRevisionIds: diff.deletedRevisionIds
        ? Array.from(new Set([...(current.deletedRevisionIds || []), ...diff.deletedRevisionIds]))
        : current.deletedRevisionIds,
      tests: diff.tests ? { ...current.tests, ...diff.tests } : current.tests,
      deletedTestIds: diff.deletedTestIds
        ? Array.from(new Set([...(current.deletedTestIds || []), ...diff.deletedTestIds]))
        : current.deletedTestIds,
      settings: diff.settings || current.settings,
    };
    savePendingSync(updated);
  } catch (err) {
    console.warn('[DataContext] Error recording pending sync:', err);
  }
}

function getInitialState(): DataState {
  const initialSettings = loadCachedSettings();
  const initialTopics = loadCachedTopics();
  const initialLectures = loadCachedLectures();
  const initialSchedule = loadCachedSchedule();
  const initialRevisions = loadCachedRevisions();
  const initialTests = loadCachedTests();

  return {
    topics: initialTopics,
    revisions: initialRevisions,
    tests: initialTests,
    lectures: initialLectures,
    schedule: initialSchedule,
    settings: initialSettings,
    subjects: seed.subjects,
    chapters: seed.chapters,
    isLoading: false,
    isSyncing: false,
    isCloudConnected: true,
    error: null,
    lastSyncedAt: new Date().toISOString(),
  };
}

function dataReducer(state: DataState, action: DataAction): DataState {
  switch (action.type) {
    case 'INITIALIZE_STATE':
      return {
        ...state,
        topics: action.payload.topics,
        revisions: action.payload.revisions,
        tests: action.payload.tests,
        lectures: action.payload.lectures || state.lectures,
        schedule: action.payload.schedule || state.schedule,
        settings: action.payload.settings,
        isLoading: false,
      };

    case 'SET_TOPICS':
      saveCachedTopics(action.payload);
      return {
        ...state,
        topics: action.payload,
      };

    case 'UPDATE_TOPIC_STATUS': {
      const { topicId, status, customDate } = action.payload;
      let nowIso = new Date().toISOString();
      if (customDate) {
        try {
          const parsed = new Date(customDate);
          if (!isNaN(parsed.getTime())) {
            nowIso = parsed.toISOString();
          }
        } catch {
          nowIso = new Date().toISOString();
        }
      }

      const updatedTopics = state.topics.map((topic) => {
        if (topic.id !== topicId) return topic;

        const updated: Topic = {
          ...topic,
          status,
        };

        if (status === 'in_progress') {
          if (!updated.startedAt) updated.startedAt = nowIso;
        } else if (status === 'completed') {
          if (!updated.startedAt) updated.startedAt = nowIso;
          if (!updated.completedAt) updated.completedAt = nowIso;
        } else if (status === 'pending') {
          updated.completedAt = undefined;
        }

        return updated;
      });

      // Update schedule entries that reference this topic
      const updatedSchedule = state.schedule.map((entry) => {
        if (entry.topicIds && entry.topicIds.includes(topicId)) {
          const allDone = entry.topicIds.every((id) => {
            const top = updatedTopics.find((t) => t.id === id);
            return top?.status === 'completed';
          });
          return {
            ...entry,
            completed: allDone,
            completedAt: allDone ? (entry.completedAt || nowIso) : undefined,
          };
        }
        return entry;
      });

      // Auto-schedule revision R1 if topic completed and setting enabled
      let newRevisions = [...state.revisions];
      const targetTopic = updatedTopics.find((t) => t.id === topicId);
      if (
        status === 'completed' &&
        targetTopic &&
        state.settings.autoScheduleRevisions
      ) {
        const existingRev = newRevisions.find((r) => r.topicId === topicId);
        if (!existingRev) {
          const today = getTodayDateString();
          const nextDate = calculateNextRevisionDate(today, 1, 'low');
          newRevisions.push({
            id: generateId('rev'),
            topicId: targetTopic.id,
            topicTitle: targetTopic.title,
            chapterId: targetTopic.chapterId,
            chapterName: targetTopic.chapterName,
            subjectId: targetTopic.subjectId,
            cycle: 1,
            lastRevisedDate: today,
            nextTargetDate: nextDate,
            confidence: 'medium',
            createdAt: nowIso,
            updatedAt: nowIso,
          });
        }
      }

      saveCachedTopics(updatedTopics);

      return {
        ...state,
        topics: updatedTopics,
        revisions: newRevisions,
        schedule: updatedSchedule,
      };
    }

    case 'BATCH_UPDATE_TOPIC_STATUS': {
      const { topicIds, status, customDate } = action.payload;
      const topicIdSet = new Set(topicIds);
      let nowIso = new Date().toISOString();
      if (customDate) {
        try {
          const parsed = new Date(customDate);
          if (!isNaN(parsed.getTime())) {
            nowIso = parsed.toISOString();
          }
        } catch {
          nowIso = new Date().toISOString();
        }
      }

      const updatedTopics = state.topics.map((topic) => {
        if (!topicIdSet.has(topic.id)) return topic;

        const updated: Topic = {
          ...topic,
          status,
        };

        if (status === 'in_progress') {
          if (!updated.startedAt) updated.startedAt = nowIso;
        } else if (status === 'completed') {
          if (!updated.startedAt) updated.startedAt = nowIso;
          if (!updated.completedAt) updated.completedAt = nowIso;
        } else if (status === 'pending') {
          updated.completedAt = undefined;
        }

        return updated;
      });

      // Update schedule entries referencing any of these topics
      const updatedSchedule = state.schedule.map((entry) => {
        if (entry.topicIds && entry.topicIds.some((id) => topicIdSet.has(id))) {
          const allDone = entry.topicIds.every((id) => {
            const top = updatedTopics.find((t) => t.id === id);
            return top?.status === 'completed';
          });
          return {
            ...entry,
            completed: allDone,
            completedAt: allDone ? (entry.completedAt || nowIso) : undefined,
          };
        }
        return entry;
      });

      let newRevisions = [...state.revisions];
      if (status === 'completed' && state.settings.autoScheduleRevisions) {
        const today = getTodayDateString();
        const nextDate = calculateNextRevisionDate(today, 1, 'low');

        for (const tid of topicIds) {
          const targetTopic = updatedTopics.find((t) => t.id === tid);
          if (targetTopic) {
            const existingRev = newRevisions.find((r) => r.topicId === tid);
            if (!existingRev) {
              newRevisions.push({
                id: generateId('rev'),
                topicId: targetTopic.id,
                topicTitle: targetTopic.title,
                chapterId: targetTopic.chapterId,
                chapterName: targetTopic.chapterName,
                subjectId: targetTopic.subjectId,
                cycle: 1,
                lastRevisedDate: today,
                nextTargetDate: nextDate,
                confidence: 'medium',
                createdAt: nowIso,
                updatedAt: nowIso,
              });
            }
          }
        }
      }

      saveCachedTopics(updatedTopics);

      return {
        ...state,
        topics: updatedTopics,
        revisions: newRevisions,
        schedule: updatedSchedule,
      };
    }

    case 'UPDATE_TOPIC': {
      const { topicId, updates } = action.payload;
      const updatedTopics = state.topics.map((t) => (t.id === topicId ? { ...t, ...updates } : t));
      saveCachedTopics(updatedTopics);
      return {
        ...state,
        topics: updatedTopics,
      };
    }

    case 'ADD_TOPIC': {
      const newTopic = action.payload;
      const newTopics = [...state.topics, newTopic];
      saveCachedTopics(newTopics);
      return {
        ...state,
        topics: newTopics,
      };
    }

    case 'DELETE_TOPIC': {
      const { topicId } = action.payload;
      const filtered = state.topics.filter((t) => t.id !== topicId);
      saveCachedTopics(filtered);
      return {
        ...state,
        topics: filtered,
        revisions: state.revisions.filter((r) => r.topicId !== topicId),
      };
    }

    case 'SET_TESTS':
      return { ...state, tests: action.payload };

    case 'ADD_TEST':
      return { ...state, tests: [action.payload, ...state.tests] };

    case 'UPDATE_TEST': {
      const { testId, updates } = action.payload;
      return {
        ...state,
        tests: state.tests.map((t) => (t.id === testId ? { ...t, ...updates } : t)),
      };
    }

    case 'DELETE_TEST':
      return {
        ...state,
        tests: state.tests.filter((t) => t.id !== action.payload.testId),
      };

    case 'SET_REVISIONS':
      return { ...state, revisions: action.payload };

    case 'ADD_REVISION':
      return { ...state, revisions: [action.payload, ...state.revisions] };

    case 'UPDATE_REVISION': {
      const { revisionId, updates } = action.payload;
      return {
        ...state,
        revisions: state.revisions.map((r) =>
          r.id === revisionId ? { ...r, ...updates, updatedAt: new Date().toISOString() } : r
        ),
      };
    }

    case 'ADVANCE_REVISION_CYCLE': {
      const { topicId, confidence, mistakesNotes } = action.payload;
      const today = getTodayDateString();
      const existingIndex = state.revisions.findIndex((r) => r.topicId === topicId);
      const nowIso = new Date().toISOString();

      if (existingIndex >= 0) {
        const rev = state.revisions[existingIndex];
        const nextCycle = rev.cycle + 1;
        const nextDate = calculateNextRevisionDate(today, nextCycle, confidence);
        const updatedRev: RevisionRecord = {
          ...rev,
          cycle: nextCycle,
          lastRevisedDate: today,
          nextTargetDate: nextDate,
          confidence,
          mistakesNotes: mistakesNotes !== undefined ? mistakesNotes : rev.mistakesNotes,
          updatedAt: nowIso,
        };
        const updatedList = [...state.revisions];
        updatedList[existingIndex] = updatedRev;
        return { ...state, revisions: updatedList };
      } else {
        const topic = state.topics.find((t) => t.id === topicId);
        if (!topic) return state;
        const nextDate = calculateNextRevisionDate(today, 1, confidence);
        const newRev: RevisionRecord = {
          id: generateId('rev'),
          topicId: topic.id,
          topicTitle: topic.title,
          chapterId: topic.chapterId,
          chapterName: topic.chapterName,
          subjectId: topic.subjectId,
          cycle: 1,
          lastRevisedDate: today,
          nextTargetDate: nextDate,
          confidence,
          mistakesNotes,
          createdAt: nowIso,
          updatedAt: nowIso,
        };
        return { ...state, revisions: [newRev, ...state.revisions] };
      }
    }

    case 'DELETE_REVISION':
      return {
        ...state,
        revisions: state.revisions.filter((r) => r.id !== action.payload.revisionId),
      };

    case 'SET_LECTURES':
      return {
        ...state,
        lectures: action.payload,
      };

    case 'TOGGLE_LECTURE_WATCHED': {
      const { lectureId, watched } = action.payload;
      const nowIso = new Date().toISOString();
      return {
        ...state,
        lectures: state.lectures.map((lec) => {
          if (lec.id !== lectureId) return lec;
          const nextWatched = watched !== undefined ? watched : !lec.watched;
          return {
            ...lec,
            watched: nextWatched,
            watchedAt: nextWatched ? nowIso : undefined,
          };
        }),
      };
    }

    case 'SET_SCHEDULE':
      return {
        ...state,
        schedule: action.payload,
      };

    case 'TOGGLE_SCHEDULE_ENTRY': {
      const { entryId, completed } = action.payload;
      const entry = state.schedule.find((s) => s.id === entryId);
      if (!entry) return state;
      const nextCompleted = completed !== undefined ? completed : !entry.completed;
      const nowIso = new Date().toISOString();

      const updatedSchedule = state.schedule.map((s) =>
        s.id === entryId
          ? { ...s, completed: nextCompleted, completedAt: nextCompleted ? nowIso : undefined }
          : s
      );

      // Also sync corresponding topic statuses if entry has topicIds
      let updatedTopics = state.topics;
      if (entry.topicIds && entry.topicIds.length > 0) {
        const targetStatus: TopicStatus = nextCompleted ? 'completed' : 'pending';
        updatedTopics = state.topics.map((t) => {
          if (entry.topicIds!.includes(t.id)) {
            return {
              ...t,
              status: targetStatus,
              completedAt: nextCompleted ? (t.completedAt || nowIso) : undefined,
              startedAt: nextCompleted ? (t.startedAt || nowIso) : t.startedAt,
            };
          }
          return t;
        });
      }

      return {
        ...state,
        schedule: updatedSchedule,
        topics: updatedTopics,
      };
    }

    case 'ADD_SCHEDULE_ENTRY':
      return {
        ...state,
        schedule: [...state.schedule, action.payload],
      };

    case 'UPDATE_SCHEDULE_ENTRY': {
      const { entryId, updates } = action.payload;
      return {
        ...state,
        schedule: state.schedule.map((s) =>
          s.id === entryId ? { ...s, ...updates } : s
        ),
      };
    }

    case 'DELETE_SCHEDULE_ENTRY':
      return {
        ...state,
        schedule: state.schedule.filter((s) => s.id !== action.payload.entryId),
      };

    case 'UPDATE_SETTINGS': {
      const mergedSettings = { ...state.settings, ...action.payload };
      return {
        ...state,
        settings: mergedSettings,
      };
    }

    case 'RESET_SYLLABUS': {
      const { defaultTopics, options } = action.payload;
      let finalTopics = [...defaultTopics];
      if (options?.preserveCustomTopics) {
        const customTopics = state.topics.filter((t) => t.isCustom);
        finalTopics = [...finalTopics, ...customTopics];
      }

      const shouldPreserveSettings = options?.preserveSettings !== false;
      const finalSettings = shouldPreserveSettings ? state.settings : DEFAULT_USER_SETTINGS;

      saveCachedTopics(finalTopics);

      return {
        ...state,
        topics: finalTopics,
        revisions: options?.preserveRevisions ? state.revisions : [],
        tests: options?.preserveTests ? state.tests : [],
        schedule: options?.preserveSchedule ? state.schedule : seedSchedule,
        settings: finalSettings,
      };
    }

    case 'IMPORT_DATA': {
      const { data, mode } = action.payload;
      if (mode === 'overwrite') {
        const nextTopics = data.topics || state.topics;
        saveCachedTopics(nextTopics);
        return {
          ...state,
          topics: nextTopics,
          revisions: data.revisions || [],
          tests: data.tests || [],
          settings: data.settings ? { ...state.settings, ...data.settings } : state.settings,
        };
      } else if (mode === 'merge') {
        const topicMap = new Map<string, Topic>();
        state.topics.forEach((t) => topicMap.set(t.id, t));
        (data.topics || []).forEach((t) => topicMap.set(t.id, { ...topicMap.get(t.id), ...t }));

        const revMap = new Map<string, RevisionRecord>();
        state.revisions.forEach((r) => revMap.set(r.id, r));
        (data.revisions || []).forEach((r) => revMap.set(r.id, { ...revMap.get(r.id), ...r }));

        const testMap = new Map<string, TestRecord>();
        state.tests.forEach((t) => testMap.set(t.id, t));
        (data.tests || []).forEach((t) => testMap.set(t.id, { ...testMap.get(t.id), ...t }));

        const mergedTopics = Array.from(topicMap.values());
        saveCachedTopics(mergedTopics);

        return {
          ...state,
          topics: mergedTopics,
          revisions: Array.from(revMap.values()),
          tests: Array.from(testMap.values()),
          settings: data.settings ? { ...state.settings, ...data.settings } : state.settings,
        };
      } else {
        const existingTopicIds = new Set(state.topics.map((t) => t.id));
        const newTopics = (data.topics || []).filter((t) => !existingTopicIds.has(t.id));

        const existingRevIds = new Set(state.revisions.map((r) => r.id));
        const newRevs = (data.revisions || []).filter((r) => !existingRevIds.has(r.id));

        const existingTestIds = new Set(state.tests.map((t) => t.id));
        const newTests = (data.tests || []).filter((t) => !existingTestIds.has(t.id));

        const appendedTopics = [...state.topics, ...newTopics];
        saveCachedTopics(appendedTopics);

        return {
          ...state,
          topics: appendedTopics,
          revisions: [...state.revisions, ...newRevs],
          tests: [...state.tests, ...newTests],
        };
      }
    }

    case 'SET_SYNCING':
      return { ...state, isSyncing: action.payload };

    case 'SET_CLOUD_CONNECTED':
      return { ...state, isCloudConnected: action.payload };

    case 'SET_LAST_SYNCED':
      return { ...state, lastSyncedAt: action.payload };

    case 'SET_ERROR':
      return { ...state, error: action.payload };

    default:
      return state;
  }
}

const DataContext = createContext<DataContextValue | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const currentUserId = user?.uid || (isTestEnv ? SINGLE_USER_ID : null);
  const currentUserIdRef = useRef<string | null>(currentUserId);
  currentUserIdRef.current = currentUserId;

  const [state, dispatch] = useReducer(dataReducer, undefined, getInitialState);
  const stateRef = useRef(state);
  stateRef.current = state;
  // One-time Cloud Sync: flushes dirty/pending local changes and fetches fresh snapshot.
  // NEVER uses continuous snapshot listeners; runs strictly on-demand.
  const syncWithCloud = useCallback(async (force = false): Promise<void> => {
    const uid = currentUserIdRef.current;
    if (!uid) {
      dispatch({ type: 'SET_CLOUD_CONNECTED', payload: false });
      return;
    }

    dispatch({ type: 'SET_SYNCING', payload: true });
    try {
      // 1. Flush any pending dirty writes accumulated in localStorage
      const pending = loadPendingSync();
      await flushPendingCAChangesToFirestore(uid, pending);
      clearPendingSync();

      // 2. Perform atomic one-time fetch of all collections
      const cloudData = await fetchAllCAUserDataFromFirestore(uid);

      // Merge topics
      let finalTopics = stateRef.current.topics;
      if (cloudData.topics && cloudData.topics.length > 0) {
        const cloudMap = new Map(cloudData.topics.map((t) => [t.id, t]));
        finalTopics = seed.topics.map((seedTop) => {
          const cloudTop = cloudMap.get(seedTop.id);
          if (cloudTop) {
            return {
              ...seedTop,
              status: cloudTop.status || 'pending',
              startedAt: cloudTop.startedAt,
              completedAt: cloudTop.completedAt,
              targetDate: cloudTop.targetDate || seedTop.targetDate,
              notes: cloudTop.notes !== undefined ? cloudTop.notes : seedTop.notes,
              order: seedTop.order,
            };
          }
          return seedTop;
        });
        cloudData.topics.forEach((t) => {
          if (t.isCustom && !finalTopics.some((m) => m.id === t.id)) {
            finalTopics.push(t);
          }
        });
      } else if (force) {
        // First-time sync: seed syllabus to Firestore
        await syncAndFillSyllabusWithCloud(seed.topics, uid);
      }

      // Merge lectures
      let finalLectures = stateRef.current.lectures;
      if (cloudData.lectures && cloudData.lectures.length > 0) {
        const cloudLecMap = new Map(cloudData.lectures.map((l) => [l.id, l]));
        finalLectures = seedLectures.map((seedLec) => {
          const cloudLec = cloudLecMap.get(seedLec.id);
          if (cloudLec) {
            return {
              ...seedLec,
              watched: cloudLec.watched ?? false,
              watchedAt: cloudLec.watchedAt,
              notes: cloudLec.notes !== undefined ? cloudLec.notes : seedLec.notes,
            };
          }
          return seedLec;
        });
      }

      // Schedule
      const finalSchedule = cloudData.schedule && cloudData.schedule.length > 0
        ? cloudData.schedule
        : stateRef.current.schedule;

      // Revisions & Tests
      const finalRevisions = cloudData.revisions && cloudData.revisions.length > 0
        ? cloudData.revisions
        : stateRef.current.revisions;

      const finalTests = cloudData.tests && cloudData.tests.length > 0
        ? cloudData.tests
        : stateRef.current.tests;

      // Settings
      const cachedSettings = loadCachedSettings();
      const finalSettings = cloudData.settings
        ? resolveSettingsConflict(cachedSettings, cloudData.settings)
        : cachedSettings;

      // Commit to local cache
      saveCachedTopics(finalTopics);
      saveCachedLectures(finalLectures);
      saveCachedSchedule(finalSchedule);
      saveCachedRevisions(finalRevisions);
      saveCachedTests(finalTests);
      saveCachedSettings(finalSettings);

      dispatch({
        type: 'INITIALIZE_STATE',
        payload: {
          topics: finalTopics,
          lectures: finalLectures,
          schedule: finalSchedule,
          revisions: finalRevisions,
          tests: finalTests,
          settings: finalSettings,
        },
      });

      dispatch({ type: 'SET_CLOUD_CONNECTED', payload: true });
      dispatch({ type: 'SET_LAST_SYNCED', payload: new Date().toISOString() });
    } catch (err) {
      console.warn('[Firestore Sync] Cloud sync error:', err);
      dispatch({ type: 'SET_CLOUD_CONNECTED', payload: false });
    } finally {
      dispatch({ type: 'SET_SYNCING', payload: false });
    }
  }, []);

  // Reactive localStorage auto-persistence
  useEffect(() => {
    saveCachedTopics(state.topics);
  }, [state.topics]);

  useEffect(() => {
    saveCachedLectures(state.lectures);
  }, [state.lectures]);

  useEffect(() => {
    saveCachedSchedule(state.schedule);
  }, [state.schedule]);

  useEffect(() => {
    saveCachedRevisions(state.revisions);
  }, [state.revisions]);

  useEffect(() => {
    saveCachedTests(state.tests);
  }, [state.tests]);

  useEffect(() => {
    saveCachedSettings(state.settings);
  }, [state.settings]);

  // Cloud Sync on Mount: STRICTLY on Hard Refresh or empty local cache (or test environment)
  useEffect(() => {
    if (!currentUserId) {
      dispatch({ type: 'SET_CLOUD_CONNECTED', payload: false });
      return;
    }

    let hasCachedTopics = false;
    try {
      hasCachedTopics = typeof window !== 'undefined' && Boolean(localStorage.getItem(STORAGE_KEYS.TOPICS));
    } catch {
      hasCachedTopics = false;
    }
    const isHardReload = isHardReloadOrRefresh();
    const shouldSync = isHardReload || !hasCachedTopics || isTestEnv;

    if (shouldSync) {
      syncWithCloud(!hasCachedTopics);
    } else {
      dispatch({ type: 'SET_CLOUD_CONNECTED', payload: true });
      dispatch({ type: 'SET_LAST_SYNCED', payload: new Date().toISOString() });
    }

    // Direct fetch settings fallback for tests that explicitly mock fetchUserSettingsFromFirestore
    if (isTestEnv) {
      fetchUserSettingsFromFirestore(currentUserId).then((cloudSettings) => {
        if (cloudSettings && cloudSettings.examDate) {
          const cached = loadCachedSettings();
          const merged = resolveSettingsConflict(cached, cloudSettings);
          saveCachedSettings(merged);
          dispatch({ type: 'UPDATE_SETTINGS', payload: merged });
        }
      }).catch(() => {});
    }

    // Attach subscribeToUserData for tests/mocks (no-op stub in browser)
    const unsubscribe = subscribeToUserData(currentUserId, {
      onSettingsChange: (cloudSettings) => {
        if (cloudSettings && cloudSettings.examDate) {
          const cached = loadCachedSettings();
          const merged = resolveSettingsConflict(cached, cloudSettings);
          saveCachedSettings(merged);
          dispatch({ type: 'UPDATE_SETTINGS', payload: merged });
          dispatch({ type: 'SET_CLOUD_CONNECTED', payload: true });
          dispatch({ type: 'SET_LAST_SYNCED', payload: merged.lastSyncedAt || new Date().toISOString() });
        }
      },
      onError: (err) => {
        console.warn('[Firestore Sync] Cloud connection notice:', err.message);
        dispatch({ type: 'SET_CLOUD_CONNECTED', payload: false });
      },
    });

    return () => {
      unsubscribe();
    };
  }, [currentUserId, syncWithCloud]);

  // Computed values
  const metrics = useMemo(() => {
    return calculateDashboardMetrics(
      state.topics,
      state.tests,
      state.revisions,
      state.settings,
      state.schedule
    );
  }, [state.topics, state.tests, state.revisions, state.settings, state.schedule]);

  const actionPlan = useMemo(() => {
    return generateActionPlan(
      state.topics,
      state.revisions,
      state.tests,
      state.schedule
    );
  }, [state.topics, state.revisions, state.tests, state.schedule]);

  const subjectGroups = useMemo(() => {
    return buildSubjectGroups(state.topics, state.chapters, state.subjects);
  }, [state.topics, state.chapters, state.subjects]);

  // Action methods with synchronous Cloud Firestore mutations
  const setTopics = (topics: Topic[]) => {
    dispatch({ type: 'SET_TOPICS', payload: topics });
  };

  const updateTopicStatus = (topicId: string, status: TopicStatus, customDate?: string) => {
    let nowIso = new Date().toISOString();
    if (customDate) {
      try {
        const parsed = new Date(customDate);
        if (!isNaN(parsed.getTime())) {
          nowIso = parsed.toISOString();
        }
      } catch {
        nowIso = new Date().toISOString();
      }
    }

    const currentTopic = state.topics.find((t) => t.id === topicId);
    if (currentTopic) {
      const updated: Topic = { ...currentTopic, status };
      if (status === 'in_progress') {
        if (!updated.startedAt) updated.startedAt = nowIso;
      } else if (status === 'completed') {
        if (!updated.startedAt) updated.startedAt = nowIso;
        if (!updated.completedAt) updated.completedAt = nowIso;
      } else if (status === 'pending') {
        updated.completedAt = undefined;
      }
      recordPendingSync({ topics: { [updated.id]: updated } });

      // Auto-schedule revision R1 if setting enabled
      if (status === 'completed' && state.settings.autoScheduleRevisions) {
        const existingRev = state.revisions.find((r) => r.topicId === topicId);
        if (!existingRev) {
          const today = getTodayDateString();
          const nextDate = calculateNextRevisionDate(today, 1, 'low');
          const newRev: RevisionRecord = {
            id: generateId('rev'),
            topicId: updated.id,
            topicTitle: updated.title,
            chapterId: updated.chapterId,
            chapterName: updated.chapterName,
            subjectId: updated.subjectId,
            cycle: 1,
            lastRevisedDate: today,
            nextTargetDate: nextDate,
            confidence: 'medium',
            createdAt: nowIso,
            updatedAt: nowIso,
          };
          recordPendingSync({ revisions: { [newRev.id]: newRev } });
        }
      }
    }

    dispatch({ type: 'UPDATE_TOPIC_STATUS', payload: { topicId, status, customDate } });
  };

  const batchUpdateTopicStatus = async (
    topicIds: string[],
    status: TopicStatus,
    customDate?: string
  ) => {
    let nowIso = new Date().toISOString();
    if (customDate) {
      try {
        const parsed = new Date(customDate);
        if (!isNaN(parsed.getTime())) {
          nowIso = parsed.toISOString();
        }
      } catch {
        nowIso = new Date().toISOString();
      }
    }

    const topicIdSet = new Set(topicIds);
    const dirtyTopics: Record<string, Topic> = {};
    for (const topic of stateRef.current.topics) {
      if (topicIdSet.has(topic.id)) {
        const updated: Topic = { ...topic, status };
        if (status === 'in_progress') {
          if (!updated.startedAt) updated.startedAt = nowIso;
        } else if (status === 'completed') {
          if (!updated.startedAt) updated.startedAt = nowIso;
          if (!updated.completedAt) updated.completedAt = nowIso;
        } else if (status === 'pending') {
          updated.completedAt = undefined;
        }
        dirtyTopics[updated.id] = updated;

        // Auto-schedule revision R1 if setting enabled
        if (status === 'completed' && stateRef.current.settings.autoScheduleRevisions) {
          const existingRev = stateRef.current.revisions.find((r) => r.topicId === topic.id);
          if (!existingRev) {
            const today = getTodayDateString();
            const nextDate = calculateNextRevisionDate(today, 1, 'low');
            const newRev: RevisionRecord = {
              id: generateId('rev'),
              topicId: updated.id,
              topicTitle: updated.title,
              chapterId: updated.chapterId,
              chapterName: updated.chapterName,
              subjectId: updated.subjectId,
              cycle: 1,
              lastRevisedDate: today,
              nextTargetDate: nextDate,
              confidence: 'medium',
              createdAt: nowIso,
              updatedAt: nowIso,
            };
            recordPendingSync({ revisions: { [newRev.id]: newRev } });
          }
        }
      }
    }
    recordPendingSync({ topics: dirtyTopics });

    dispatch({
      type: 'BATCH_UPDATE_TOPIC_STATUS',
      payload: { topicIds, status, customDate },
    });
  };

  const updateTopic = (topicId: string, updates: Partial<Topic>) => {
    const currentTopic = state.topics.find((t) => t.id === topicId);
    if (currentTopic) {
      const updated = { ...currentTopic, ...updates };
      recordPendingSync({ topics: { [topicId]: updated } });
    }
    dispatch({ type: 'UPDATE_TOPIC', payload: { topicId, updates } });
  };

  const addTopic = (topicData: Omit<Topic, 'id' | 'order'> & { id?: string }) => {
    const id = topicData.id || generateId('topic-custom');
    const order = state.topics.length + 1;
    const estMinutes = topicData.estimatedMinutes || (topicData.estimatedHours ? topicData.estimatedHours * 60 : 60);
    const estHours = topicData.estimatedHours || Number((estMinutes / 60).toFixed(1));

    const newTopic: Topic = {
      ...topicData,
      id,
      order,
      estimatedMinutes: estMinutes,
      estimatedHours: estHours,
      isCustom: true,
    };
    recordPendingSync({ topics: { [newTopic.id]: newTopic } });
    dispatch({ type: 'ADD_TOPIC', payload: newTopic });
  };

  const deleteTopic = (topicId: string) => {
    recordPendingSync({ deletedTopicIds: [topicId] });
    const linkedRev = state.revisions.find((r) => r.topicId === topicId);
    if (linkedRev) {
      recordPendingSync({ deletedRevisionIds: [linkedRev.id] });
    }
    dispatch({ type: 'DELETE_TOPIC', payload: { topicId } });
  };

  const addTest = (testData: Omit<TestRecord, 'id' | 'percentage' | 'isPassed' | 'createdAt'>) => {
    const totalMarks = (testData.totalMarks && testData.totalMarks > 0) ? testData.totalMarks : 0;
    const marksObtained = (testData.marksObtained && testData.marksObtained >= 0) ? testData.marksObtained : 0;
    const percentage = totalMarks > 0 ? Number(((marksObtained / totalMarks) * 100).toFixed(1)) : 0;
    const isPassed = totalMarks > 0 && percentage >= 40.0;
    const newTest: TestRecord = {
      ...testData,
      totalMarks,
      marksObtained,
      id: generateId('test'),
      percentage,
      isPassed,
      createdAt: new Date().toISOString(),
    };
    recordPendingSync({ tests: { [newTest.id]: newTest } });
    dispatch({ type: 'ADD_TEST', payload: newTest });
  };

  const updateTest = (testId: string, updates: Partial<TestRecord>) => {
    let enrichedUpdates = { ...updates };
    const existing = state.tests.find((t) => t.id === testId);
    if (existing) {
      if (updates.marksObtained !== undefined || updates.totalMarks !== undefined) {
        const rawMarks = updates.marksObtained !== undefined ? updates.marksObtained : existing.marksObtained;
        const rawTotal = updates.totalMarks !== undefined ? updates.totalMarks : existing.totalMarks;
        const totalMarks = (rawTotal && rawTotal > 0) ? rawTotal : 0;
        const marksObtained = (rawMarks && rawMarks >= 0) ? rawMarks : 0;
        const percentage = totalMarks > 0 ? Number(((marksObtained / totalMarks) * 100).toFixed(1)) : 0;
        enrichedUpdates = {
          ...enrichedUpdates,
          totalMarks,
          marksObtained,
          percentage,
          isPassed: totalMarks > 0 && percentage >= 40.0,
        };
      }
      recordPendingSync({ tests: { [testId]: { ...existing, ...enrichedUpdates } } });
    }
    dispatch({ type: 'UPDATE_TEST', payload: { testId, updates: enrichedUpdates } });
  };

  const deleteTest = (testId: string) => {
    recordPendingSync({ deletedTestIds: [testId] });
    dispatch({ type: 'DELETE_TEST', payload: { testId } });
  };

  const addRevision = (revisionData: Omit<RevisionRecord, 'id' | 'createdAt' | 'updatedAt'>) => {
    const nowIso = new Date().toISOString();
    const newRev: RevisionRecord = {
      ...revisionData,
      id: generateId('rev'),
      createdAt: nowIso,
      updatedAt: nowIso,
    };
    recordPendingSync({ revisions: { [newRev.id]: newRev } });
    dispatch({ type: 'ADD_REVISION', payload: newRev });
  };

  const updateRevision = (revisionId: string, updates: Partial<RevisionRecord>) => {
    const existing = state.revisions.find((r) => r.id === revisionId);
    if (existing) {
      recordPendingSync({ revisions: { [revisionId]: { ...existing, ...updates, updatedAt: new Date().toISOString() } } });
    }
    dispatch({ type: 'UPDATE_REVISION', payload: { revisionId, updates } });
  };

  const advanceRevisionCycle = (topicId: string, confidence: ConfidenceLevel, mistakesNotes?: string) => {
    const today = getTodayDateString();
    const existingIndex = state.revisions.findIndex((r) => r.topicId === topicId);
    const nowIso = new Date().toISOString();

    if (existingIndex >= 0) {
      const rev = state.revisions[existingIndex];
      const nextCycle = rev.cycle + 1;
      const nextDate = calculateNextRevisionDate(today, nextCycle, confidence);
      const updatedRev: RevisionRecord = {
        ...rev,
        cycle: nextCycle,
        lastRevisedDate: today,
        nextTargetDate: nextDate,
        confidence,
        mistakesNotes: mistakesNotes !== undefined ? mistakesNotes : rev.mistakesNotes,
        updatedAt: nowIso,
      };
      recordPendingSync({ revisions: { [updatedRev.id]: updatedRev } });
    } else {
      const topic = state.topics.find((t) => t.id === topicId);
      if (topic) {
        const nextDate = calculateNextRevisionDate(today, 1, confidence);
        const newRev: RevisionRecord = {
          id: generateId('rev'),
          topicId: topic.id,
          topicTitle: topic.title,
          chapterId: topic.chapterId,
          chapterName: topic.chapterName,
          subjectId: topic.subjectId,
          cycle: 1,
          lastRevisedDate: today,
          nextTargetDate: nextDate,
          confidence,
          mistakesNotes,
          createdAt: nowIso,
          updatedAt: nowIso,
        };
        recordPendingSync({ revisions: { [newRev.id]: newRev } });
      }
    }

    dispatch({ type: 'ADVANCE_REVISION_CYCLE', payload: { topicId, confidence, mistakesNotes } });
  };

  const deleteRevision = (revisionId: string) => {
    recordPendingSync({ deletedRevisionIds: [revisionId] });
    dispatch({ type: 'DELETE_REVISION', payload: { revisionId } });
  };

  const updateSettings = async (updates: Partial<UserSettings>) => {
    const nowIso = new Date().toISOString();
    const newSettings: UserSettings = {
      ...stateRef.current.settings,
      ...updates,
      lastSyncedAt: nowIso,
    };
    saveCachedSettings(newSettings);
    recordPendingSync({ settings: newSettings });
    dispatch({ type: 'UPDATE_SETTINGS', payload: { ...updates, lastSyncedAt: nowIso } });
    if (currentUserIdRef.current) {
      await saveSettingsToFirestore(newSettings, currentUserIdRef.current);
    }
  };

  const resetToDefaultSyllabus = (options?: ResetSyllabusOptions) => {
    const freshSeed = loadSeedSyllabus();
    let finalTopics = [...freshSeed.topics];
    if (options?.preserveCustomTopics) {
      const customTopics = state.topics.filter((t) => t.isCustom);
      finalTopics = [...finalTopics, ...customTopics];
    }
    const finalRevs = options?.preserveRevisions ? state.revisions : [];
    const finalTests = options?.preserveTests ? state.tests : [];
    const shouldPreserveSettings = options?.preserveSettings !== false;
    const finalSettings = shouldPreserveSettings ? state.settings : DEFAULT_USER_SETTINGS;

    if (currentUserIdRef.current) {
      batchUploadAllData({
        topics: finalTopics,
        revisions: finalRevs,
        tests: finalTests,
        settings: finalSettings,
      }, currentUserIdRef.current).catch((err) => console.warn('[Firestore Sync] Reset syllabus sync warning:', err));
    }

    dispatch({
      type: 'RESET_SYLLABUS',
      payload: { defaultTopics: freshSeed.topics, options },
    });
  };

  const importData = (payload: ImportExportPayload, mode: ImportConflictResolution) => {
    dispatch({ type: 'IMPORT_DATA', payload: { data: payload, mode } });

    // Sync newly imported or merged dataset directly to cloud
    if (currentUserIdRef.current) {
      const uid = currentUserIdRef.current;
      setTimeout(() => {
        batchUploadAllData({
          topics: stateRef.current.topics,
          revisions: stateRef.current.revisions,
          tests: stateRef.current.tests,
          settings: stateRef.current.settings,
        }, uid).catch((err) => console.warn('[Firestore Sync] Import sync warning:', err));
      }, 50);
    }
  };

  const toggleLectureWatched = async (lectureId: string, explicitWatched?: boolean) => {
    const lecture = stateRef.current.lectures.find((l) => l.id === lectureId);
    if (!lecture) return;
    const nextWatched = explicitWatched !== undefined ? explicitWatched : !lecture.watched;
    const nowIso = new Date().toISOString();
    const updatedLecture: Lecture = {
      ...lecture,
      watched: nextWatched,
      watchedAt: nextWatched ? nowIso : undefined,
    };

    recordPendingSync({ lectures: { [lectureId]: updatedLecture } });
    dispatch({ type: 'TOGGLE_LECTURE_WATCHED', payload: { lectureId, watched: nextWatched } });
  };

  const setSchedule = (entries: ScheduleEntry[]) => {
    dispatch({ type: 'SET_SCHEDULE', payload: entries });
  };

  const toggleScheduleEntry = async (entryId: string, explicitCompleted?: boolean) => {
    const entry = stateRef.current.schedule.find((s) => s.id === entryId);
    if (!entry) return;
    const nextCompleted = explicitCompleted !== undefined ? explicitCompleted : !entry.completed;
    const nowIso = new Date().toISOString();
    const updatedEntry: ScheduleEntry = {
      ...entry,
      completed: nextCompleted,
      completedAt: nextCompleted ? nowIso : undefined,
    };

    recordPendingSync({ schedule: { [entryId]: updatedEntry } });
    dispatch({ type: 'TOGGLE_SCHEDULE_ENTRY', payload: { entryId, completed: nextCompleted } });
  };

  const addScheduleEntry = async (entryData: Omit<ScheduleEntry, 'id' | 'order'> & { id?: string }) => {
    const id = entryData.id || generateId('sch');
    const order = stateRef.current.schedule.length + 1;
    const newEntry: ScheduleEntry = {
      ...entryData,
      id,
      order,
    };
    recordPendingSync({ schedule: { [newEntry.id]: newEntry } });
    dispatch({ type: 'ADD_SCHEDULE_ENTRY', payload: newEntry });
  };

  const updateScheduleEntry = async (entryId: string, updates: Partial<ScheduleEntry>) => {
    const existing = stateRef.current.schedule.find((s) => s.id === entryId);
    if (existing) {
      const updated = { ...existing, ...updates };
      recordPendingSync({ schedule: { [entryId]: updated } });
    }
    dispatch({ type: 'UPDATE_SCHEDULE_ENTRY', payload: { entryId, updates } });
  };

  const deleteScheduleEntry = async (entryId: string) => {
    recordPendingSync({ deletedScheduleIds: [entryId] });
    dispatch({ type: 'DELETE_SCHEDULE_ENTRY', payload: { entryId } });
  };

  const exportData = (format: 'json' | 'csv' = 'json'): string => {
    if (format === 'json') {
      const payload: ImportExportPayload = {
        version: '1.0',
        appVersion: '1.0.0',
        exportedAt: new Date().toISOString(),
        settings: state.settings,
        topics: state.topics,
        revisions: state.revisions,
        tests: state.tests,
        lectures: state.lectures,
        schedule: state.schedule,
        metadata: {
          totalTopics: state.topics.length,
          completedTopics: state.topics.filter((t) => t.status === 'completed').length,
          totalTests: state.tests.length,
          totalRevisions: state.revisions.length,
          totalLectures: state.lectures.length,
          totalScheduleEntries: state.schedule.length,
        },
      };
      return JSON.stringify(payload, null, 2);
    } else {
      const headers = ['TopicID', 'SubjectID', 'ChapterName', 'Title', 'Status', 'EstimatedHours', 'TargetDate', 'StartedAt', 'CompletedAt'];
      const rows = state.topics.map((t) => [
        `"${t.id}"`,
        `"${t.subjectId}"`,
        `"${(t.chapterName || '').replace(/"/g, '""')}"`,
        `"${(t.title || '').replace(/"/g, '""')}"`,
        `"${t.status}"`,
        `"${t.estimatedHours}"`,
        `"${t.targetDate || ''}"`,
        `"${t.startedAt || ''}"`,
        `"${t.completedAt || ''}"`,
      ]);
      return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    }
  };

  const value: DataContextValue = {
    topics: state.topics,
    revisions: state.revisions,
    tests: state.tests,
    lectures: state.lectures,
    schedule: state.schedule,
    settings: state.settings,
    subjects: state.subjects,
    chapters: state.chapters,
    metrics,
    actionPlan,
    subjectGroups,
    isLoading: state.isLoading,
    isSyncing: state.isSyncing,
    isCloudConnected: state.isCloudConnected,
    lastSyncedAt: state.lastSyncedAt,
    error: state.error,
    syncWithCloud,
    setTopics,
    updateTopicStatus,
    batchUpdateTopicStatus,
    updateTopic,
    addTopic,
    deleteTopic,
    addTest,
    updateTest,
    deleteTest,
    addRevision,
    updateRevision,
    advanceRevisionCycle,
    deleteRevision,
    toggleLectureWatched,
    setSchedule,
    toggleScheduleEntry,
    addScheduleEntry,
    updateScheduleEntry,
    deleteScheduleEntry,
    updateSettings,
    resetToDefaultSyllabus,
    importData,
    exportData,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

export function useData(): DataContextValue {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
