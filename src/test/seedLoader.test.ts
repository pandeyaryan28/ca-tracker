import { describe, it, expect } from 'vitest';
import {
  loadSeedSyllabus,
  buildSubjectGroups,
  calculateDashboardMetrics,
  generateActionPlan,
  calculateStreak,
} from '@/lib/seedLoader';
import { DEFAULT_USER_SETTINGS } from '@/lib/constants';
import { Topic, TestRecord, RevisionRecord } from '@/types';

describe('Syllabus Blueprint & Seed Loader Integrity', () => {
  const seed = loadSeedSyllabus();

  it('loads exactly 4 papers, 46 chapters, and 99 topics', () => {
    expect(seed.subjects).toHaveLength(4);
    expect(seed.chapters).toHaveLength(46);
    expect(seed.topics).toHaveLength(99);
  });

  it('has zero duplicate topic IDs across the entire syllabus', () => {
    const topicIds = seed.topics.map((t) => t.id);
    const uniqueIds = new Set(topicIds);
    expect(uniqueIds.size).toBe(99);
  });

  it('has zero duplicate chapter IDs across the entire syllabus', () => {
    const chapterIds = seed.chapters.map((c) => c.id);
    const uniqueIds = new Set(chapterIds);
    expect(uniqueIds.size).toBe(46);
  });

  it('verifies exact chapter and topic counts per subject paper', () => {
    const p1Topics = seed.topics.filter((t) => t.subjectId === 'paper1');
    const p2Topics = seed.topics.filter((t) => t.subjectId === 'paper2');
    const p3Topics = seed.topics.filter((t) => t.subjectId === 'paper3');
    const p4Topics = seed.topics.filter((t) => t.subjectId === 'paper4');

    const p1Chapters = seed.chapters.filter((c) => c.subjectId === 'paper1');
    const p2Chapters = seed.chapters.filter((c) => c.subjectId === 'paper2');
    const p3Chapters = seed.chapters.filter((c) => c.subjectId === 'paper3');
    const p4Chapters = seed.chapters.filter((c) => c.subjectId === 'paper4');

    // Paper 1: Accounting (11 chapters, 33 topics)
    expect(p1Chapters).toHaveLength(11);
    expect(p1Topics).toHaveLength(33);

    // Paper 2: Business Laws (7 chapters, 20 topics)
    expect(p2Chapters).toHaveLength(7);
    expect(p2Topics).toHaveLength(20);

    // Paper 3: Quantitative Aptitude (18 chapters, 20 topics)
    expect(p3Chapters).toHaveLength(18);
    expect(p3Topics).toHaveLength(20);

    // Paper 4: Business Economics (10 chapters, 26 topics)
    expect(p4Chapters).toHaveLength(10);
    expect(p4Topics).toHaveLength(26);

    // Sum check: 11+7+18+10 = 46 chapters; 33+20+20+26 = 99 topics
    expect(p1Chapters.length + p2Chapters.length + p3Chapters.length + p4Chapters.length).toBe(46);
    expect(p1Topics.length + p2Topics.length + p3Topics.length + p4Topics.length).toBe(99);
  });

  it('verifies every topic has valid positive estimated hours and required metadata', () => {
    for (const t of seed.topics) {
      expect(t.title).toBeTruthy();
      expect(t.chapterName).toBeTruthy();
      expect(t.estimatedMinutes).toBeGreaterThan(0);
      expect(t.estimatedHours).toBeGreaterThan(0);
      expect(t.status).toBe('pending');
      expect(t.order).toBeGreaterThan(0);
      expect(['paper1', 'paper2', 'paper3', 'paper4']).toContain(t.subjectId);
    }
  });

  it('builds subject groups with accurate counts and percentages', () => {
    const groups = buildSubjectGroups(seed.topics, seed.chapters, seed.subjects);
    
    expect(groups.paper1.totalTopics).toBe(33);
    expect(groups.paper1.completedTopics).toBe(0);
    expect(groups.paper1.progressPercentage).toBe(0);

    expect(groups.paper2.totalTopics).toBe(20);
    expect(groups.paper3.totalTopics).toBe(20);
    expect(groups.paper4.totalTopics).toBe(26);
  });

  it('computes dashboard metrics and projected passing threshold accurately', () => {
    // Fresh state
    const freshMetrics = calculateDashboardMetrics(seed.topics, [], [], DEFAULT_USER_SETTINGS);
    expect(freshMetrics.totalTopics).toBe(99);
    expect(freshMetrics.completedTopics).toBe(0);
    expect(freshMetrics.overallProgressPercentage).toBe(0);
    expect(freshMetrics.aggregatePassingLikelihood).toBe('At Risk');

    // Simulate completing 50% across all 4 papers
    const halfCompletedTopics: Topic[] = seed.topics.map((t, idx) => ({
      ...t,
      status: idx % 2 === 0 ? 'completed' : 'pending',
    }));

    const halfMetrics = calculateDashboardMetrics(halfCompletedTopics, [], [], DEFAULT_USER_SETTINGS);
    expect(halfMetrics.completedTopics).toBe(50);
    expect(halfMetrics.overallProgressPercentage).toBe(51);
    expect(halfMetrics.aggregatePassingLikelihood).toBe('On Track');
  });

  it('generates dynamic action plan items for scheduled topics and revisions', () => {
    const today = new Date().toISOString().split('T')[0];
    const topicsWithTarget: Topic[] = [
      {
        ...seed.topics[0],
        targetDate: today,
        status: 'pending',
      },
    ];

    const revisions: RevisionRecord[] = [
      {
        id: 'rev-1',
        topicId: seed.topics[1].id,
        topicTitle: seed.topics[1].title,
        subjectId: 'paper1',
        cycle: 1,
        lastRevisedDate: today,
        nextTargetDate: today,
        confidence: 'medium',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    const actionPlan = generateActionPlan(topicsWithTarget, revisions, []);
    expect(actionPlan).toHaveLength(2);
    expect(actionPlan[0].type).toBe('lesson');
    expect(actionPlan[1].type).toBe('revision');
    expect(actionPlan[0].isCompleted).toBe(false);
  });

  it('calculates study streak correctly across consecutive active dates', () => {
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    const tests: TestRecord[] = [
      {
        id: 'test-1',
        title: 'Mock 1',
        subjectId: 'paper1',
        testType: 'mock',
        dateAttempted: yesterdayStr,
        marksObtained: 60,
        totalMarks: 100,
        percentage: 60,
        isPassed: true,
        createdAt: new Date().toISOString(),
      },
      {
        id: 'test-2',
        title: 'Mock 2',
        subjectId: 'paper2',
        testType: 'mock',
        dateAttempted: today,
        marksObtained: 70,
        totalMarks: 100,
        percentage: 70,
        isPassed: true,
        createdAt: new Date().toISOString(),
      },
    ];

    const streak = calculateStreak([], [], tests);
    expect(streak.currentStreak).toBe(2);
    expect(streak.bestStreak).toBe(2);
  });

  it('buildSubjectGroups dynamically integrates custom chapters without dropping topics', () => {
    const customTopic: Topic = {
      id: 'custom-topic-999',
      subjectId: 'paper1',
      chapterId: 'paper1-custom-chapter',
      chapterName: 'RTP Marathon Practice',
      title: 'Company Accounts RTP Questions',
      status: 'completed',
      estimatedMinutes: 120,
      estimatedHours: 2.0,
      order: 130,
      isCustom: true,
    };

    const groups = buildSubjectGroups([...seed.topics, customTopic], seed.chapters, seed.subjects);
    expect(groups.paper1.totalTopics).toBe(34);
    expect(groups.paper1.completedTopics).toBe(1);
    const customChapter = groups.paper1.chapters.find((c) => c.id === 'paper1-custom-chapter');
    expect(customChapter).toBeDefined();
    expect(customChapter?.title).toBe('RTP Marathon Practice');
    expect(customChapter?.completedTopicsCount).toBe(1);
  });

  it('calculateStreak safely handles corrupted or non-standard date strings', () => {
    const topicsWithCorruptDate: Topic[] = [
      {
        ...seed.topics[0],
        completedAt: '2026-99-99T00:00:00Z',
      },
      {
        ...seed.topics[1],
        completedAt: 'invalid-date-string',
      },
    ];

    expect(() => {
      const streak = calculateStreak(topicsWithCorruptDate, [], []);
      expect(streak.currentStreak).toBe(0);
      expect(streak.bestStreak).toBe(0);
    }).not.toThrow();
  });
});
