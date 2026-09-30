import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  doc,
  writeBatch,
  setDoc,
  collection,
  getDocs,
  getDoc,
} from 'firebase/firestore';
import blueprintRaw from '../src/data/syllabus_blueprint.json';
import { DEFAULT_USER_SETTINGS } from '../src/lib/constants';

const firebaseConfig = {
  apiKey: 'AIzaSyCjkT4s7WOWLzTCLd8LWcwiOY59-_RHtq0',
  authDomain: 'ca-tracker-ap28-2026.firebaseapp.com',
  projectId: 'ca-tracker-ap28-2026',
  storageBucket: 'ca-tracker-ap28-2026.firebasestorage.app',
  messagingSenderId: '1038633329972',
  appId: '1:1038633329972:web:fc067ebe3d82d1f4da7161',
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

function normalizeSubjectId(rawId: string | number): string {
  if (typeof rawId === 'number') {
    switch (rawId) {
      case 1: return 'paper1';
      case 2: return 'paper2';
      case 3: return 'paper3';
      case 4: return 'paper4';
      default: return 'paper1';
    }
  }
  const lower = String(rawId).toLowerCase();
  if (lower.includes('paper-1') || lower.includes('paper1') || lower.includes('acc')) return 'paper1';
  if (lower.includes('paper-2') || lower.includes('paper2') || lower.includes('law')) return 'paper2';
  if (lower.includes('paper-3') || lower.includes('paper3') || lower.includes('qa') || lower.includes('quant')) return 'paper3';
  if (lower.includes('paper-4') || lower.includes('paper4') || lower.includes('eco')) return 'paper4';
  return 'paper1';
}

function sanitize(data: any) {
  return JSON.parse(JSON.stringify(data));
}

async function syncSyllabus() {
  console.log('🚀 Starting Syllabus & PDF Synchronization to Firebase Firestore...');
  const userId = 'default_user';

  // 1. Sync Blueprint Metadata
  console.log('📦 Syncing Syllabus Blueprint Root Document with PDF links...');
  await setDoc(
    doc(db, 'syllabus_blueprints', '2024.1-New-Scheme'),
    sanitize({
      id: blueprintRaw.id,
      version: blueprintRaw.version,
      title: blueprintRaw.title,
      academicBody: blueprintRaw.academicBody,
      scheme: blueprintRaw.scheme,
      lastUpdated: blueprintRaw.lastUpdated,
      totalPapers: blueprintRaw.totalPapers,
      totalMarks: blueprintRaw.totalMarks,
      passingCriteria: blueprintRaw.passingCriteria,
      subjects: blueprintRaw.subjects,
      updatedAt: new Date().toISOString(),
    }),
    { merge: true }
  );

  // 2. Fetch existing topics to preserve user progress
  const existingTopicsSnap = await getDocs(collection(db, 'users', userId, 'topics'));
  const existingTopicsMap = new Map<string, any>();
  existingTopicsSnap.forEach((d) => existingTopicsMap.set(d.id, d.data()));

  const topics: any[] = [];
  const blueprintTopicIds = new Set<string>();
  let globalOrder = 1;

  for (const rawSub of blueprintRaw.subjects) {
    const subjectId = normalizeSubjectId(rawSub.id || rawSub.paperNumber);

    for (const rawCh of rawSub.chapters) {
      for (const rawTop of rawCh.topics) {
        blueprintTopicIds.add(rawTop.id);
        const estMinutes = rawTop.estimatedMinutes || 60;
        const existing = existingTopicsMap.get(rawTop.id);

        const topic = {
          id: rawTop.id,
          subjectId,
          chapterId: rawCh.id,
          chapterName: rawCh.title,
          topicNumber: rawTop.topicNumber,
          title: rawTop.title,
          status: existing?.status || 'pending',
          startedAt: existing?.startedAt || null,
          completedAt: existing?.completedAt || null,
          targetDate: existing?.targetDate || null,
          estimatedMinutes: estMinutes,
          estimatedHours: Number((estMinutes / 60).toFixed(1)),
          order: globalOrder++,
          isCustom: false,
          learningObjectives: rawTop.learningObjectives || [],
          hasPracticalProblems: rawTop.hasPracticalProblems ?? false,
          hasTheoryQuestions: rawTop.hasTheoryQuestions ?? true,
          revisionCycleDefaultDays: rawTop.revisionCycleDefaultDays || [1, 7, 21, 45],
          notes: existing?.notes !== undefined ? existing.notes : ((rawTop as any).notes || null),
          pdfUrl: (rawTop as any).pdfUrl || (rawCh as any).pdfUrl || null,
          pdfTitle: (rawTop as any).pdfTitle || (rawCh as any).pdfTitle || `${rawCh.title} - ${rawTop.title}`,
          videoUrl: (rawTop as any).videoUrl || (rawCh as any).videoUrl || null,
          videoTitle: (rawTop as any).videoTitle || (rawCh as any).videoTitle || null,
        };
        topics.push(topic);
      }
    }
  }

  // Retain any custom topics created by user
  existingTopicsMap.forEach((existing, id) => {
    if (!blueprintTopicIds.has(id)) {
      topics.push(existing);
    }
  });

  console.log(`📊 Extracted and merged ${topics.length} topics.`);

  // 3. Write in batches of 400
  const BATCH_SIZE = 400;
  const allOps: Array<(batch: ReturnType<typeof writeBatch>) => void> = [];

  // Settings: Preserve existing user settings (exam date, goals, etc.)
  const existingSettingsSnap = await getDoc(doc(db, 'users', userId, 'settings', 'user_settings'));
  if (!existingSettingsSnap.exists()) {
    console.log('⚙️ Initializing user_settings with default settings...');
    allOps.push((batch) => {
      batch.set(doc(db, 'users', userId, 'settings', 'user_settings'), sanitize(DEFAULT_USER_SETTINGS), { merge: true });
    });
  } else {
    console.log('⚙️ Existing user_settings detected, preserving user target exam date and preferences.');
  }

  // Topics
  topics.forEach((top) => {
    allOps.push((batch) => {
      batch.set(doc(db, 'users', userId, 'topics', top.id), sanitize(top), { merge: true });
    });
  });

  console.log(`💾 Committing ${allOps.length} operations to Firestore...`);

  for (let i = 0; i < allOps.length; i += BATCH_SIZE) {
    const chunk = allOps.slice(i, i + BATCH_SIZE);
    const batch = writeBatch(db);
    chunk.forEach((op) => op(batch));
    await batch.commit();
    console.log(`  ✓ Batch chunk ${Math.floor(i / BATCH_SIZE) + 1} committed successfully.`);
  }

  console.log('🎉 Successfully synchronized all topics with May 2026 onwards PDF links to Firebase Firestore!');
  process.exit(0);
}

syncSyllabus().catch((err) => {
  console.error('❌ Syllabus Sync Failed:', err);
  process.exit(1);
});
