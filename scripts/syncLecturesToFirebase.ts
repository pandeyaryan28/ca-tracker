import { initializeApp } from 'firebase/app';
import { getFirestore, doc, writeBatch, collection, getDocs } from 'firebase/firestore';
import accountsLecturesRaw from '../src/data/accounts_lectures.json';
import lawLecturesRaw from '../src/data/law_lectures.json';
import ecoLecturesRaw from '../src/data/eco_lectures.json';

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

async function syncLectures() {
  console.log('🚀 Starting Comprehensive Lectures Synchronization to Firebase Firestore...');
  const userId = 'default_user';

  const allSeedLectures = [
    ...(accountsLecturesRaw as any[]).map((l) => ({ ...l, subjectId: normalizeSubjectId(l.subjectId), watched: false })),
    ...(lawLecturesRaw as any[]).map((l) => ({ ...l, subjectId: normalizeSubjectId(l.subjectId), watched: false })),
    ...(ecoLecturesRaw as any[]).map((l) => ({ ...l, subjectId: normalizeSubjectId(l.subjectId), watched: false })),
  ];

  console.log(`📦 Prepared ${allSeedLectures.length} total lectures:`);
  console.log(`   - Paper 1 (Accounts): ${accountsLecturesRaw.length}`);
  console.log(`   - Paper 2 (Business Laws): ${lawLecturesRaw.length}`);
  console.log(`   - Paper 4 (Business Economics): ${ecoLecturesRaw.length}`);

  // Fetch existing lectures from Firestore to preserve user watch status
  const existingSnap = await getDocs(collection(db, 'users', userId, 'lectures'));
  const existingMap = new Map<string, any>();
  existingSnap.forEach((d) => existingMap.set(d.id, d.data()));
  console.log(`🔍 Existing lectures found in Firestore: ${existingMap.size}`);

  const batch = writeBatch(db);
  allSeedLectures.forEach((seedLec) => {
    const existing = existingMap.get(seedLec.id);
    const merged = existing
      ? {
          ...seedLec,
          watched: existing.watched ?? false,
          watchedAt: existing.watchedAt || null,
          notes: existing.notes !== undefined ? existing.notes : (seedLec.notes || null),
        }
      : seedLec;

    batch.set(doc(db, 'users', userId, 'lectures', merged.id), sanitize(merged), { merge: true });
  });

  await batch.commit();
  console.log(`✅ Successfully committed ${allSeedLectures.length} lectures to Firestore!`);
  process.exit(0);
}

syncLectures().catch((err) => {
  console.error('❌ Failed to sync lectures:', err);
  process.exit(1);
});
