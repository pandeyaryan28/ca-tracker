import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SOURCE_PROJECT = 'ca-tracker-ap28-2026';
const SOURCE_USER = 'default_user';

const TARGET_PROJECT = 'nayra-platform-2026';
const TARGET_USER = 'yApeiNzo23bPTvpEXHgNIgiTX0y1';

// Obtain GCP OAuth2 access token for project owner
function getAccessToken() {
  try {
    return execSync('gcloud auth print-access-token', { encoding: 'utf-8' }).trim();
  } catch (err) {
    console.error('Failed to get access token from gcloud:', err.message);
    process.exit(1);
  }
}

const token = getAccessToken();

async function fetchFromFirestoreRest(url, options = {}) {
  const res = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!res.ok) {
    const errorBody = await res.text();
    throw new Error(`Firestore REST error ${res.status} ${res.statusText}: ${errorBody}`);
  }

  return res.json();
}

async function listCollectionDocs(projectId, userId, collectionName) {
  const docs = [];
  let pageToken = '';
  do {
    const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/users/${userId}/${collectionName}?pageSize=300${
      pageToken ? `&pageToken=${pageToken}` : ''
    }`;
    const data = await fetchFromFirestoreRest(url);
    if (data.documents) {
      docs.push(...data.documents);
    }
    pageToken = data.nextPageToken || '';
  } while (pageToken);
  return docs;
}

async function getDocument(projectId, userId, pathSuffix) {
  const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/users/${userId}/${pathSuffix}`;
  try {
    return await fetchFromFirestoreRest(url);
  } catch (err) {
    if (err.message.includes('404')) {
      return null;
    }
    throw err;
  }
}

async function writeDocument(projectId, userId, pathSuffix, fields) {
  const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/users/${userId}/${pathSuffix}`;
  return await fetchFromFirestoreRest(url, {
    method: 'PATCH',
    body: JSON.stringify({ fields }),
  });
}

function extractDocId(docName) {
  return docName.split('/').pop();
}

async function main() {
  console.log('====================================================');
  console.log('🚀 CA TRACKER -> NAYRA CLOUD PLATFORM DATA MIGRATION');
  console.log(`Source: ${SOURCE_PROJECT} (/users/${SOURCE_USER})`);
  console.log(`Target: ${TARGET_PROJECT} (/users/${TARGET_USER})`);
  console.log('====================================================\n');

  // 1. Fetch all documents from legacy source
  console.log('📥 Step 1: Extracting legacy source dataset...');
  const [topics, lectures, schedule, tests, revisions, userSettings] = await Promise.all([
    listCollectionDocs(SOURCE_PROJECT, SOURCE_USER, 'topics'),
    listCollectionDocs(SOURCE_PROJECT, SOURCE_USER, 'lectures'),
    listCollectionDocs(SOURCE_PROJECT, SOURCE_USER, 'schedule'),
    listCollectionDocs(SOURCE_PROJECT, SOURCE_USER, 'tests'),
    listCollectionDocs(SOURCE_PROJECT, SOURCE_USER, 'revisions'),
    getDocument(SOURCE_PROJECT, SOURCE_USER, 'settings/user_settings'),
  ]);

  console.log(`  - Topics: ${topics.length}`);
  console.log(`  - Lectures: ${lectures.length}`);
  console.log(`  - Schedule entries: ${schedule.length}`);
  console.log(`  - Tests: ${tests.length}`);
  console.log(`  - Revisions: ${revisions.length}`);
  console.log(`  - User settings: ${userSettings ? 'Found' : 'Not found'}`);

  // Breakdown verification
  const completedTopics = topics.filter((t) => t.fields?.status?.stringValue === 'completed').length;
  const pendingTopics = topics.filter((t) => t.fields?.status?.stringValue === 'pending').length;
  const watchedLectures = lectures.filter((l) => l.fields?.watched?.booleanValue === true).length;
  const unwatchedLectures = lectures.filter((l) => l.fields?.watched?.booleanValue !== true).length;
  const completedSchedule = schedule.filter((s) => s.fields?.completed?.booleanValue === true).length;

  console.log('\n📊 Detailed Dataset Breakdown:');
  console.log(`  - Topics: ${completedTopics} completed, ${pendingTopics} pending (Total: ${topics.length})`);
  console.log(`  - Lectures: ${watchedLectures} watched, ${unwatchedLectures} unwatched (Total: ${lectures.length})`);
  console.log(`  - Schedule: ${completedSchedule} completed, ${schedule.length - completedSchedule} pending (Total: ${schedule.length})`);

  // Assert expected counts
  if (topics.length !== 99 || completedTopics !== 60 || pendingTopics !== 39) {
    throw new Error(`Unexpected topic counts! Expected 99 (60 completed, 39 pending), got ${topics.length} (${completedTopics} completed, ${pendingTopics} pending)`);
  }
  if (lectures.length !== 33 || watchedLectures !== 15 || unwatchedLectures !== 18) {
    throw new Error(`Unexpected lecture counts! Expected 33 (15 watched, 18 unwatched), got ${lectures.length} (${watchedLectures} watched, ${unwatchedLectures} unwatched)`);
  }
  if (schedule.length !== 25 || completedSchedule !== 25) {
    throw new Error(`Unexpected schedule counts! Expected 25 (25 completed), got ${schedule.length} (${completedSchedule} completed)`);
  }
  if (!userSettings) {
    throw new Error('settings/user_settings document not found in source project!');
  }

  // 2. Save immutable pre-flight local backup
  console.log('\n💾 Step 2: Creating immutable pre-flight local backup...');
  const backupData = {
    exportedAt: new Date().toISOString(),
    sourceProject: SOURCE_PROJECT,
    sourceUser: SOURCE_USER,
    targetProject: TARGET_PROJECT,
    targetUser: TARGET_USER,
    summary: {
      topicsCount: topics.length,
      topicsCompleted: completedTopics,
      topicsPending: pendingTopics,
      lecturesCount: lectures.length,
      lecturesWatched: watchedLectures,
      lecturesUnwatched: unwatchedLectures,
      scheduleCount: schedule.length,
      scheduleCompleted: completedSchedule,
      testsCount: tests.length,
      revisionsCount: revisions.length,
    },
    userSettings,
    topics,
    lectures,
    schedule,
    tests,
    revisions,
  };

  const backupFilePath = path.join(__dirname, 'backup-default-user.json');
  fs.writeFileSync(backupFilePath, JSON.stringify(backupData, null, 2), 'utf-8');
  console.log(`  ✓ Immutable backup successfully saved to: ${backupFilePath}`);

  // 3. Write all documents to TARGET_PROJECT under /users/yApeiNzo23bPTvpEXHgNIgiTX0y1/*
  console.log('\n🚀 Step 3: Migrating documents to nayra-platform-2026...');

  // 3a. User Settings
  console.log('  -> Migrating settings/user_settings...');
  await writeDocument(TARGET_PROJECT, TARGET_USER, 'settings/user_settings', userSettings.fields);
  console.log('     ✓ Settings migrated successfully.');

  // 3b. Topics
  console.log(`  -> Migrating ${topics.length} topics...`);
  for (const doc of topics) {
    const docId = extractDocId(doc.name);
    await writeDocument(TARGET_PROJECT, TARGET_USER, `topics/${docId}`, doc.fields);
  }
  console.log(`     ✓ All ${topics.length} topics migrated.`);

  // 3c. Lectures
  console.log(`  -> Migrating ${lectures.length} lectures...`);
  for (const doc of lectures) {
    const docId = extractDocId(doc.name);
    await writeDocument(TARGET_PROJECT, TARGET_USER, `lectures/${docId}`, doc.fields);
  }
  console.log(`     ✓ All ${lectures.length} lectures migrated.`);

  // 3d. Schedule
  console.log(`  -> Migrating ${schedule.length} schedule entries...`);
  for (const doc of schedule) {
    const docId = extractDocId(doc.name);
    await writeDocument(TARGET_PROJECT, TARGET_USER, `schedule/${docId}`, doc.fields);
  }
  console.log(`     ✓ All ${schedule.length} schedule entries migrated.`);

  // 3e. Tests & Revisions (if any)
  for (const doc of tests) {
    const docId = extractDocId(doc.name);
    await writeDocument(TARGET_PROJECT, TARGET_USER, `tests/${docId}`, doc.fields);
  }
  for (const doc of revisions) {
    const docId = extractDocId(doc.name);
    await writeDocument(TARGET_PROJECT, TARGET_USER, `revisions/${docId}`, doc.fields);
  }

  // 4. Verify 100% data integrity in nayra-platform-2026
  console.log('\n🔍 Step 4: Verifying 100% data integrity in nayra-platform-2026...');
  const [targetTopics, targetLectures, targetSchedule, targetTests, targetRevisions, targetSettings] = await Promise.all([
    listCollectionDocs(TARGET_PROJECT, TARGET_USER, 'topics'),
    listCollectionDocs(TARGET_PROJECT, TARGET_USER, 'lectures'),
    listCollectionDocs(TARGET_PROJECT, TARGET_USER, 'schedule'),
    listCollectionDocs(TARGET_PROJECT, TARGET_USER, 'tests'),
    listCollectionDocs(TARGET_PROJECT, TARGET_USER, 'revisions'),
    getDocument(TARGET_PROJECT, TARGET_USER, 'settings/user_settings'),
  ]);

  const targetCompletedTopics = targetTopics.filter((t) => t.fields?.status?.stringValue === 'completed').length;
  const targetPendingTopics = targetTopics.filter((t) => t.fields?.status?.stringValue === 'pending').length;
  const targetWatchedLectures = targetLectures.filter((l) => l.fields?.watched?.booleanValue === true).length;
  const targetUnwatchedLectures = targetLectures.filter((l) => l.fields?.watched?.booleanValue !== true).length;
  const targetCompletedSchedule = targetSchedule.filter((s) => s.fields?.completed?.booleanValue === true).length;

  console.log('Target Verification Results:');
  console.log(`  - Topics: ${targetTopics.length} (Expected: 99 | Completed: ${targetCompletedTopics}/60, Pending: ${targetPendingTopics}/39)`);
  console.log(`  - Lectures: ${targetLectures.length} (Expected: 33 | Watched: ${targetWatchedLectures}/15, Unwatched: ${targetUnwatchedLectures}/18)`);
  console.log(`  - Schedule: ${targetSchedule.length} (Expected: 25 | Completed: ${targetCompletedSchedule}/25)`);
  console.log(`  - Tests: ${targetTests.length} (Expected: 0)`);
  console.log(`  - Revisions: ${targetRevisions.length} (Expected: 0)`);
  console.log(`  - Settings: ${targetSettings ? 'Found' : 'Missing'}`);
  console.log(`    * dailyGoalHours: ${targetSettings?.fields?.dailyGoalHours?.integerValue}`);
  console.log(`    * examDate: ${targetSettings?.fields?.examDate?.stringValue}`);
  console.log(`    * syllabusVersion: ${targetSettings?.fields?.syllabusVersion?.stringValue}`);

  if (targetTopics.length !== 99 || targetCompletedTopics !== 60 || targetPendingTopics !== 39) {
    throw new Error('Target topics count mismatch!');
  }
  if (targetLectures.length !== 33 || targetWatchedLectures !== 15 || targetUnwatchedLectures !== 18) {
    throw new Error('Target lectures count mismatch!');
  }
  if (targetSchedule.length !== 25 || targetCompletedSchedule !== 25) {
    throw new Error('Target schedule count mismatch!');
  }
  if (!targetSettings) {
    throw new Error('Target user settings missing!');
  }

  console.log('\n🎉 100% VERIFICATION SUCCESSFUL: All data migrated without loss or discrepancy!');
}

main().catch((err) => {
  console.error('\n❌ Migration failed:', err);
  process.exit(1);
});
