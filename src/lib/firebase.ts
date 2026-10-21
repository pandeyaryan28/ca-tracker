import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  Firestore,
  getFirestore,
  collection,
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  getDocs,
  writeBatch,
} from 'firebase/firestore';
import { getAuth, Auth, GoogleAuthProvider } from 'firebase/auth';
import { Topic, RevisionRecord, TestRecord, UserSettings, Lecture, ScheduleEntry } from '@/types';

// Unified Firebase configuration for NAYRA and CA Tracker platform
const firebaseConfig = {
  apiKey: import.meta.env?.VITE_FIREBASE_API_KEY || 'AIzaSyDC7zjTuvEIRV-e-dntemxNu6zXVL0DX1I',
  authDomain: import.meta.env?.VITE_FIREBASE_AUTH_DOMAIN || 'nayra-platform-2026.firebaseapp.com',
  projectId: import.meta.env?.VITE_FIREBASE_PROJECT_ID || 'nayra-platform-2026',
  storageBucket: import.meta.env?.VITE_FIREBASE_STORAGE_BUCKET || 'nayra-platform-2026.firebasestorage.app',
  messagingSenderId: import.meta.env?.VITE_FIREBASE_MESSAGING_SENDER_ID || '413144887088',
  appId: import.meta.env?.VITE_FIREBASE_APP_ID || '1:413144887088:web:bd35b4bdd1bfb682bc22f5',
};

// Singleton Firebase App Initialization
export const app: FirebaseApp =
  getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Multi-Tab Persistent Firestore Initialization with safe fallback
let firestoreInstance: Firestore;
try {
  firestoreInstance = initializeFirestore(app, {
    localCache: persistentLocalCache({
      tabManager: persistentMultipleTabManager(),
    }),
  });
} catch {
  // Graceful fallback for test runners or environments without IndexedDB multi-tab lock
  firestoreInstance = getFirestore(app);
}

export const db: Firestore = firestoreInstance;
export const auth: Auth = getAuth(app);

export const googleAuthProvider = new GoogleAuthProvider();
googleAuthProvider.setCustomParameters({
  prompt: 'select_account',
});

export const isTestEnv =
  (typeof process !== 'undefined' && (process.env?.NODE_ENV === 'test' || Boolean(process.env?.VITEST))) ||
  (typeof window !== 'undefined' && Boolean((window as any).__VITEST__));

export const SINGLE_USER_ID = isTestEnv ? 'test_fixture_user' : 'default_user';

/**
 * Strips undefined properties so Firestore writes never fail on optional attributes
 */
export function sanitizeForFirestore<T>(data: T): Record<string, unknown> {
  return JSON.parse(JSON.stringify(data));
}

/**
 * User-scoped Firestore Collection & Document Helpers
 */
export const getUserTopicsCollection = (userId: string = SINGLE_USER_ID) =>
  collection(db, 'users', userId, 'topics');

export const getUserCATopicsCollection = (userId: string = SINGLE_USER_ID) =>
  collection(db, 'users', userId, 'caTopics');

/**
 * Detects whether the current navigation event is a page refresh or hard reload.
 */
export function isHardReloadOrRefresh(): boolean {
  if (typeof window === 'undefined' || !window.performance) return false;
  try {
    const navEntries = window.performance.getEntriesByType('navigation');
    if (navEntries && navEntries.length > 0) {
      const nav = navEntries[0] as PerformanceNavigationTiming;
      return nav.type === 'reload';
    }
    return (window.performance as any).navigation?.type === 1;
  } catch {
    return false;
  }
}

export const getUserTestsCollection = (userId: string = SINGLE_USER_ID) =>
  collection(db, 'users', userId, 'tests');

export const getUserRevisionsCollection = (userId: string = SINGLE_USER_ID) =>
  collection(db, 'users', userId, 'revisions');

export const getUserLecturesCollection = (userId: string = SINGLE_USER_ID) =>
  collection(db, 'users', userId, 'lectures');

export const getUserScheduleCollection = (userId: string = SINGLE_USER_ID) =>
  collection(db, 'users', userId, 'schedule');

export const getUserSettingsDoc = (userId: string = SINGLE_USER_ID) =>
  doc(db, 'users', userId, 'settings', 'user_settings');

/**
 * Sync helpers for user data
 */
export async function syncDocumentToFirestore(
  collectionPath: string,
  docId: string,
  data: Record<string, unknown>
): Promise<void> {
  try {
    const docRef = doc(db, collectionPath, docId);
    await setDoc(docRef, sanitizeForFirestore(data), { merge: true });
  } catch (err) {
    console.warn(`[Firestore Sync] Failed to sync ${collectionPath}/${docId}:`, err);
  }
}

export async function deleteDocumentFromFirestore(
  collectionPath: string,
  docId: string
): Promise<void> {
  try {
    const docRef = doc(db, collectionPath, docId);
    await deleteDoc(docRef);
  } catch (err) {
    console.warn(`[Firestore Sync] Failed to delete ${collectionPath}/${docId}:`, err);
  }
}

export async function saveTopicToFirestore(
  topic: Topic,
  userId: string = SINGLE_USER_ID
): Promise<void> {
  try {
    const topicRef = doc(db, 'users', userId, 'topics', topic.id);
    await setDoc(topicRef, sanitizeForFirestore(topic), { merge: true });
  } catch (err) {
    console.warn(`[Firestore Sync] Failed to save topic ${topic.id}:`, err);
  }
}

export async function deleteTopicFromFirestore(
  topicId: string,
  userId: string = SINGLE_USER_ID
): Promise<void> {
  try {
    const topicRef = doc(db, 'users', userId, 'topics', topicId);
    await deleteDoc(topicRef);
  } catch (err) {
    console.warn(`[Firestore Sync] Failed to delete topic ${topicId}:`, err);
  }
}

export async function saveTestToFirestore(
  test: TestRecord,
  userId: string = SINGLE_USER_ID
): Promise<void> {
  try {
    const testRef = doc(db, 'users', userId, 'tests', test.id);
    await setDoc(testRef, sanitizeForFirestore(test), { merge: true });
  } catch (err) {
    console.warn(`[Firestore Sync] Failed to save test ${test.id}:`, err);
  }
}

export async function deleteTestFromFirestore(
  testId: string,
  userId: string = SINGLE_USER_ID
): Promise<void> {
  try {
    const testRef = doc(db, 'users', userId, 'tests', testId);
    await deleteDoc(testRef);
  } catch (err) {
    console.warn(`[Firestore Sync] Failed to delete test ${testId}:`, err);
  }
}

export async function saveRevisionToFirestore(
  revision: RevisionRecord,
  userId: string = SINGLE_USER_ID
): Promise<void> {
  try {
    const revRef = doc(db, 'users', userId, 'revisions', revision.id);
    await setDoc(revRef, sanitizeForFirestore(revision), { merge: true });
  } catch (err) {
    console.warn(`[Firestore Sync] Failed to save revision ${revision.id}:`, err);
  }
}

export async function deleteRevisionFromFirestore(
  revisionId: string,
  userId: string = SINGLE_USER_ID
): Promise<void> {
  try {
    const revRef = doc(db, 'users', userId, 'revisions', revisionId);
    await deleteDoc(revRef);
  } catch (err) {
    console.warn(`[Firestore Sync] Failed to delete revision ${revisionId}:`, err);
  }
}

export async function saveSettingsToFirestore(
  settings: UserSettings,
  userId: string = SINGLE_USER_ID
): Promise<void> {
  try {
    const settingsRef = getUserSettingsDoc(userId);
    await setDoc(settingsRef, sanitizeForFirestore(settings), { merge: true });
  } catch (err) {
    console.warn(`[Firestore Sync] Failed to save settings:`, err);
  }
}

export async function fetchUserSettingsFromFirestore(
  userId: string = SINGLE_USER_ID
): Promise<UserSettings | null> {
  try {
    const settingsRef = getUserSettingsDoc(userId);
    const snap = await getDoc(settingsRef);
    if (snap.exists()) {
      return snap.data() as UserSettings;
    }
    return null;
  } catch (err) {
    console.warn('[Firestore Sync] Failed to fetch settings from Firestore:', err);
    return null;
  }
}

export async function syncSettingsWithCloud(
  localSettings: UserSettings,
  userId: string = SINGLE_USER_ID
): Promise<UserSettings> {
  try {
    const settingsRef = getUserSettingsDoc(userId);
    const snap = await getDoc(settingsRef);
    if (snap.exists()) {
      const cloudData = snap.data() as UserSettings;
      const localTime = localSettings.lastSyncedAt ? new Date(localSettings.lastSyncedAt).getTime() : 0;
      const cloudTime = cloudData.lastSyncedAt ? new Date(cloudData.lastSyncedAt).getTime() : 0;

      let resolvedExamDate = (cloudData.examDate && cloudData.examDate.trim()) || localSettings.examDate;
      if (localTime > cloudTime) {
        resolvedExamDate = localSettings.examDate;
      }

      const merged: UserSettings = {
        ...localSettings,
        ...cloudData,
        examDate: resolvedExamDate,
      };

      if (localTime > cloudTime) {
        await setDoc(settingsRef, sanitizeForFirestore(merged), { merge: true });
      }

      return merged;
    } else {
      await setDoc(settingsRef, sanitizeForFirestore(localSettings), { merge: true });
      return localSettings;
    }
  } catch (err) {
    console.warn('[Firestore Sync] Failed to sync settings with cloud:', err);
    return localSettings;
  }
}

export async function saveLectureToFirestore(
  lecture: Lecture,
  userId: string = SINGLE_USER_ID
): Promise<void> {
  try {
    const lecRef = doc(db, 'users', userId, 'lectures', lecture.id);
    await setDoc(lecRef, sanitizeForFirestore(lecture), { merge: true });
  } catch (err) {
    console.warn(`[Firestore Sync] Failed to save lecture ${lecture.id}:`, err);
  }
}

export async function syncLecturesWithCloud(
  seedLectures: Lecture[],
  userId: string = SINGLE_USER_ID
): Promise<Lecture[]> {
  try {
    const lecCol = getUserLecturesCollection(userId);
    const existingSnap = await getDocs(lecCol);
    const existingMap = new Map<string, Lecture>();

    existingSnap.forEach((docSnap) => {
      existingMap.set(docSnap.id, docSnap.data() as Lecture);
    });

    const mergedLectures: Lecture[] = seedLectures.map((seedLec) => {
      const existing = existingMap.get(seedLec.id);
      if (existing) {
        return {
          ...seedLec,
          watched: existing.watched ?? false,
          watchedAt: existing.watchedAt,
          notes: existing.notes !== undefined ? existing.notes : seedLec.notes,
        };
      }
      return seedLec;
    });

    // Write batch to Firestore
    const batch = writeBatch(db);
    mergedLectures.forEach((lec) => {
      batch.set(doc(db, 'users', userId, 'lectures', lec.id), sanitizeForFirestore(lec), { merge: true });
    });
    await batch.commit();

    return mergedLectures;
  } catch (err) {
    console.warn('[Firestore Sync] syncLecturesWithCloud error:', err);
    return seedLectures;
  }
}

export async function saveScheduleEntryToFirestore(
  entry: ScheduleEntry,
  userId: string = SINGLE_USER_ID
): Promise<void> {
  try {
    const entryRef = doc(db, 'users', userId, 'schedule', entry.id);
    await setDoc(entryRef, sanitizeForFirestore(entry), { merge: true });
  } catch (err) {
    console.warn(`[Firestore Sync] Failed to save schedule entry ${entry.id}:`, err);
  }
}

export async function deleteScheduleEntryFromFirestore(
  entryId: string,
  userId: string = SINGLE_USER_ID
): Promise<void> {
  try {
    const entryRef = doc(db, 'users', userId, 'schedule', entryId);
    await deleteDoc(entryRef);
  } catch (err) {
    console.warn(`[Firestore Sync] Failed to delete schedule entry ${entryId}:`, err);
  }
}

export async function syncScheduleWithCloud(
  seedSchedule: ScheduleEntry[],
  userId: string = SINGLE_USER_ID
): Promise<ScheduleEntry[]> {
  try {
    const schedCol = getUserScheduleCollection(userId);
    const existingSnap = await getDocs(schedCol);
    const existingMap = new Map<string, ScheduleEntry>();

    existingSnap.forEach((docSnap) => {
      existingMap.set(docSnap.id, docSnap.data() as ScheduleEntry);
    });

    const mergedSchedule: ScheduleEntry[] = seedSchedule.map((seedEntry) => {
      const existing = existingMap.get(seedEntry.id);
      if (existing) {
        return {
          ...seedEntry,
          completed: existing.completed ?? false,
          completedAt: existing.completedAt,
          notes: existing.notes !== undefined ? existing.notes : seedEntry.notes,
        };
      }
      return seedEntry;
    });

    // Also preserve any custom entries created by user
    existingMap.forEach((entry, id) => {
      if (!mergedSchedule.some((s) => s.id === id)) {
        mergedSchedule.push(entry);
      }
    });

    // Sort by date and order
    mergedSchedule.sort((a, b) => {
      if (a.date !== b.date) return a.date.localeCompare(b.date);
      return (a.order || 0) - (b.order || 0);
    });

    // Write batch to Firestore
    const batch = writeBatch(db);
    mergedSchedule.forEach((entry) => {
      batch.set(doc(db, 'users', userId, 'schedule', entry.id), sanitizeForFirestore(entry), { merge: true });
    });
    await batch.commit();

    return mergedSchedule;
  } catch (err) {
    console.warn('[Firestore Sync] syncScheduleWithCloud error:', err);
    return seedSchedule;
  }
}

export interface SyncPayload {
  topics: Topic[];
  revisions: RevisionRecord[];
  tests: TestRecord[];
  lectures?: Lecture[];
  settings: UserSettings;
}

/**
 * Data-preserving synchronization of researched syllabus blueprint with Cloud Firestore backend.
 * Merges detailed syllabus research while retaining all previous user progress (completed status, timestamps, notes, custom topics).
 */
export async function syncAndFillSyllabusWithCloud(
  blueprintTopics: Topic[],
  userId: string = SINGLE_USER_ID
): Promise<{ totalMerged: number; customPreserved: number }> {
  try {
    const topicsCol = getUserTopicsCollection(userId);
    const existingSnap = await getDocs(topicsCol);
    const existingTopicsMap = new Map<string, Topic>();

    existingSnap.forEach((docSnap) => {
      existingTopicsMap.set(docSnap.id, docSnap.data() as Topic);
    });

    const mergedTopics: Topic[] = [];
    const blueprintTopicIds = new Set<string>();

    blueprintTopics.forEach((bTopic) => {
      blueprintTopicIds.add(bTopic.id);
      const existing = existingTopicsMap.get(bTopic.id);
      if (existing) {
        // PRESERVE user progress (status, timestamps, notes, targetDate)
        mergedTopics.push({
          ...bTopic,
          status: existing.status || 'pending',
          startedAt: existing.startedAt,
          completedAt: existing.completedAt,
          targetDate: existing.targetDate,
          notes: existing.notes !== undefined ? existing.notes : bTopic.notes,
          isCustom: false,
        });
      } else {
        mergedTopics.push({
          ...bTopic,
          status: 'pending',
        });
      }
    });

    // PRESERVE only genuine custom topics created by the user (isCustom: true)
    let customPreserved = 0;
    const obsoleteDocIdsToDelete: string[] = [];
    existingTopicsMap.forEach((existing, id) => {
      if (!blueprintTopicIds.has(id)) {
        if (existing.isCustom) {
          mergedTopics.push(existing);
          customPreserved++;
        } else {
          obsoleteDocIdsToDelete.push(id);
        }
      }
    });

    // Batch commit to Firestore
    const BATCH_SIZE = 400;
    for (let i = 0; i < mergedTopics.length; i += BATCH_SIZE) {
      const chunk = mergedTopics.slice(i, i + BATCH_SIZE);
      const batch = writeBatch(db);
      chunk.forEach((top) => {
        batch.set(doc(db, 'users', userId, 'topics', top.id), sanitizeForFirestore(top), { merge: true });
      });
      await batch.commit();
    }

    // Delete obsolete non-custom blueprint topics from Firestore
    if (obsoleteDocIdsToDelete.length > 0) {
      for (let i = 0; i < obsoleteDocIdsToDelete.length; i += BATCH_SIZE) {
        const chunk = obsoleteDocIdsToDelete.slice(i, i + BATCH_SIZE);
        const batch = writeBatch(db);
        chunk.forEach((id) => {
          batch.delete(doc(db, 'users', userId, 'topics', id));
        });
        await batch.commit();
      }
    }

    return { totalMerged: mergedTopics.length, customPreserved };
  } catch (err) {
    console.warn('[Firestore Sync] syncAndFillSyllabusWithCloud error:', err);
    throw err;
  }
}

export async function batchUploadAllData(
  payload: SyncPayload,
  userId: string = SINGLE_USER_ID
): Promise<void> {
  try {
    const { topics, revisions, tests, settings } = payload;
    
    const BATCH_SIZE = 400;
    const operations: Array<(batch: ReturnType<typeof writeBatch>) => void> = [];

    // Settings
    operations.push((batch) => {
      batch.set(getUserSettingsDoc(userId), sanitizeForFirestore(settings), { merge: true });
    });

    // Topics
    topics.forEach((topic) => {
      operations.push((batch) => {
        batch.set(doc(db, 'users', userId, 'topics', topic.id), sanitizeForFirestore(topic), { merge: true });
      });
    });

    // Revisions
    revisions.forEach((rev) => {
      operations.push((batch) => {
        batch.set(doc(db, 'users', userId, 'revisions', rev.id), sanitizeForFirestore(rev), { merge: true });
      });
    });

    // Tests
    tests.forEach((test) => {
      operations.push((batch) => {
        batch.set(doc(db, 'users', userId, 'tests', test.id), sanitizeForFirestore(test), { merge: true });
      });
    });

    for (let i = 0; i < operations.length; i += BATCH_SIZE) {
      const chunk = operations.slice(i, i + BATCH_SIZE);
      const batch = writeBatch(db);
      chunk.forEach((op) => op(batch));
      await batch.commit();
    }
  } catch (err) {
    console.warn('[Firestore Sync] Batch upload failed:', err);
    throw err;
  }
}

export interface CAPendingSync {
  topics?: Record<string, Topic>;
  deletedTopicIds?: string[];
  lectures?: Record<string, Lecture>;
  schedule?: Record<string, ScheduleEntry>;
  deletedScheduleIds?: string[];
  revisions?: Record<string, RevisionRecord>;
  deletedRevisionIds?: string[];
  tests?: Record<string, TestRecord>;
  deletedTestIds?: string[];
  settings?: UserSettings;
}

/**
 * Atomic one-time fetch of all CA Tracker datasets from Firestore.
 * Does NOT open continuous listeners; charges 1 read per document once.
 */
export async function fetchAllCAUserDataFromFirestore(userId: string = SINGLE_USER_ID): Promise<{
  topics: Topic[];
  lectures: Lecture[];
  schedule: ScheduleEntry[];
  revisions: RevisionRecord[];
  tests: TestRecord[];
  settings: UserSettings | null;
}> {
  try {
    const [settingsSnap, topicsSnap, caTopicsSnap, lecSnap, schedSnap, revSnap, testsSnap] = await Promise.all([
      getDoc(getUserSettingsDoc(userId)).catch(() => null),
      getDocs(getUserTopicsCollection(userId)).catch(() => null),
      getDocs(collection(db, 'users', userId, 'caTopics')).catch(() => null),
      getDocs(getUserLecturesCollection(userId)).catch(() => null),
      getDocs(getUserScheduleCollection(userId)).catch(() => null),
      getDocs(getUserRevisionsCollection(userId)).catch(() => null),
      getDocs(getUserTestsCollection(userId)).catch(() => null),
    ]);

    const settings = settingsSnap?.exists() ? (settingsSnap.data() as UserSettings) : null;

    let topics: Topic[] = [];
    if (topicsSnap && !topicsSnap.empty) {
      topics = topicsSnap.docs.map((d) => d.data() as Topic);
    } else if (caTopicsSnap && !caTopicsSnap.empty) {
      topics = caTopicsSnap.docs.map((d) => d.data() as Topic);
    }
    topics.sort((a, b) => (a.order || 0) - (b.order || 0));

    const lectures: Lecture[] = lecSnap && !lecSnap.empty ? lecSnap.docs.map((d) => d.data() as Lecture) : [];
    lectures.sort((a, b) => {
      const subA = String(a.subjectId || '');
      const subB = String(b.subjectId || '');
      if (subA !== subB) return subA.localeCompare(subB);
      return (a.order || 0) - (b.order || 0);
    });

    const schedule: ScheduleEntry[] = schedSnap && !schedSnap.empty ? schedSnap.docs.map((d) => d.data() as ScheduleEntry) : [];
    schedule.sort((a, b) => {
      if (a.date !== b.date) return a.date.localeCompare(b.date);
      return (a.order || 0) - (b.order || 0);
    });

    const revisions: RevisionRecord[] = revSnap && !revSnap.empty ? revSnap.docs.map((d) => d.data() as RevisionRecord) : [];
    const tests: TestRecord[] = testsSnap && !testsSnap.empty ? testsSnap.docs.map((d) => d.data() as TestRecord) : [];
    tests.sort((a, b) => new Date(b.createdAt || b.dateAttempted).getTime() - new Date(a.createdAt || a.dateAttempted).getTime());

    return { topics, lectures, schedule, revisions, tests, settings };
  } catch (err) {
    console.warn('[Firestore Sync] fetchAllCAUserDataFromFirestore error:', err);
    return { topics: [], lectures: [], schedule: [], revisions: [], tests: [], settings: null };
  }
}

/**
 * Pushes only dirty / pending local changes to Firestore in a single batch write.
 */
export async function flushPendingCAChangesToFirestore(
  userId: string = SINGLE_USER_ID,
  pending: CAPendingSync
): Promise<void> {
  const hasTopics = pending.topics && Object.keys(pending.topics).length > 0;
  const hasDeletedTopics = pending.deletedTopicIds && pending.deletedTopicIds.length > 0;
  const hasLectures = pending.lectures && Object.keys(pending.lectures).length > 0;
  const hasSchedule = pending.schedule && Object.keys(pending.schedule).length > 0;
  const hasDeletedSchedule = pending.deletedScheduleIds && pending.deletedScheduleIds.length > 0;
  const hasRevisions = pending.revisions && Object.keys(pending.revisions).length > 0;
  const hasDeletedRevisions = pending.deletedRevisionIds && pending.deletedRevisionIds.length > 0;
  const hasTests = pending.tests && Object.keys(pending.tests).length > 0;
  const hasDeletedTests = pending.deletedTestIds && pending.deletedTestIds.length > 0;
  const hasSettings = Boolean(pending.settings);

  if (
    !hasTopics &&
    !hasDeletedTopics &&
    !hasLectures &&
    !hasSchedule &&
    !hasDeletedSchedule &&
    !hasRevisions &&
    !hasDeletedRevisions &&
    !hasTests &&
    !hasDeletedTests &&
    !hasSettings
  ) {
    return;
  }

  const batch = writeBatch(db);
  if (pending.settings) {
    batch.set(getUserSettingsDoc(userId), sanitizeForFirestore(pending.settings), { merge: true });
  }
  if (hasTopics) {
    Object.values(pending.topics!).forEach((topic) => {
      batch.set(doc(db, 'users', userId, 'topics', topic.id), sanitizeForFirestore(topic), { merge: true });
    });
  }
  if (hasDeletedTopics) {
    pending.deletedTopicIds!.forEach((id) => {
      batch.delete(doc(db, 'users', userId, 'topics', id));
    });
  }
  if (hasLectures) {
    Object.values(pending.lectures!).forEach((lec) => {
      batch.set(doc(db, 'users', userId, 'lectures', lec.id), sanitizeForFirestore(lec), { merge: true });
    });
  }
  if (hasSchedule) {
    Object.values(pending.schedule!).forEach((entry) => {
      batch.set(doc(db, 'users', userId, 'schedule', entry.id), sanitizeForFirestore(entry), { merge: true });
    });
  }
  if (hasDeletedSchedule) {
    pending.deletedScheduleIds!.forEach((id) => {
      batch.delete(doc(db, 'users', userId, 'schedule', id));
    });
  }
  if (hasRevisions) {
    Object.values(pending.revisions!).forEach((rev) => {
      batch.set(doc(db, 'users', userId, 'revisions', rev.id), sanitizeForFirestore(rev), { merge: true });
    });
  }
  if (hasDeletedRevisions) {
    pending.deletedRevisionIds!.forEach((id) => {
      batch.delete(doc(db, 'users', userId, 'revisions', id));
    });
  }
  if (hasTests) {
    Object.values(pending.tests!).forEach((test) => {
      batch.set(doc(db, 'users', userId, 'tests', test.id), sanitizeForFirestore(test), { merge: true });
    });
  }
  if (hasDeletedTests) {
    pending.deletedTestIds!.forEach((id) => {
      batch.delete(doc(db, 'users', userId, 'tests', id));
    });
  }

  await batch.commit();
}

export interface UserDataSubscriptions {
  onTopicsChange?: (topics: Topic[]) => void;
  onRevisionsChange?: (revisions: RevisionRecord[]) => void;
  onTestsChange?: (tests: TestRecord[]) => void;
  onLecturesChange?: (lectures: Lecture[]) => void;
  onScheduleChange?: (schedule: ScheduleEntry[]) => void;
  onSettingsChange?: (settings: UserSettings) => void;
  onError?: (error: Error) => void;
}

/**
 * Continuous listeners are intentionally disabled in CA Tracker to eliminate background read/write costs.
 * CA Tracker relies on localStorage caching and syncs only on hard refresh or manual trigger.
 */
export function subscribeToUserData(
  _userId: string = SINGLE_USER_ID,
  _subscriptions: UserDataSubscriptions
): () => void {
  return () => {};
}
