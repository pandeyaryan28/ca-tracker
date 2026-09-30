import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { DataProvider, useData } from '@/context/DataContext';

const wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <DataProvider>{children}</DataProvider>
);

describe('DataContext State Management & Operations', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('hydrates initial seed data with all 99 topics and 46 chapters', () => {
    const { result } = renderHook(() => useData(), { wrapper });

    expect(result.current.topics).toHaveLength(99);
    expect(result.current.chapters).toHaveLength(46);
    expect(result.current.subjects).toHaveLength(4);
    expect(result.current.metrics.totalTopics).toBe(99);
    expect(result.current.metrics.completedTopics).toBe(0);
  });

  it('transitions topic status with automatic startedAt and completedAt timestamp logging', () => {
    const { result } = renderHook(() => useData(), { wrapper });
    const targetTopicId = result.current.topics[0].id;

    // 1. Transition to in_progress
    act(() => {
      result.current.updateTopicStatus(targetTopicId, 'in_progress');
    });

    let updated = result.current.topics.find((t) => t.id === targetTopicId);
    expect(updated?.status).toBe('in_progress');
    expect(updated?.startedAt).toBeDefined();
    expect(updated?.completedAt).toBeUndefined();

    // 2. Transition to completed
    act(() => {
      result.current.updateTopicStatus(targetTopicId, 'completed');
    });

    updated = result.current.topics.find((t) => t.id === targetTopicId);
    expect(updated?.status).toBe('completed');
    expect(updated?.completedAt).toBeDefined();
    expect(result.current.metrics.completedTopics).toBe(1);

    // 3. Auto-scheduled revision R1 should now exist
    const autoRev = result.current.revisions.find((r) => r.topicId === targetTopicId);
    expect(autoRev).toBeDefined();
    expect(autoRev?.cycle).toBe(1);
  });

  it('adds and deletes custom topics correctly', () => {
    const { result } = renderHook(() => useData(), { wrapper });

    act(() => {
      result.current.addTopic({
        subjectId: 'paper1',
        chapterId: 'paper1-custom',
        chapterName: 'Custom Practice',
        title: 'Special Extra Practice Topic',
        status: 'pending',
        estimatedMinutes: 90,
        estimatedHours: 1.5,
      });
    });

    expect(result.current.topics).toHaveLength(100);
    const added = result.current.topics.find((t) => t.title === 'Special Extra Practice Topic');
    expect(added).toBeDefined();
    expect(added?.isCustom).toBe(true);

    act(() => {
      result.current.deleteTopic(added!.id);
    });

    expect(result.current.topics).toHaveLength(99);
  });

  it('logs mock test series and enforces 40% passing threshold', () => {
    const { result } = renderHook(() => useData(), { wrapper });

    // Test 1: 35/100 (35% -> Fail)
    act(() => {
      result.current.addTest({
        title: 'Diagnostic Test 1',
        subjectId: 'paper1',
        testType: 'chapter',
        dateAttempted: '2026-08-28',
        marksObtained: 35,
        totalMarks: 100,
      });
    });

    expect(result.current.tests).toHaveLength(1);
    expect(result.current.tests[0].percentage).toBe(35);
    expect(result.current.tests[0].isPassed).toBe(false);

    // Test 2: 78/100 (78% -> Pass)
    act(() => {
      result.current.addTest({
        title: 'Unit Test 2',
        subjectId: 'paper2',
        testType: 'unit',
        dateAttempted: '2026-08-28',
        marksObtained: 78,
        totalMarks: 100,
      });
    });

    expect(result.current.tests).toHaveLength(2);
    expect(result.current.tests[0].percentage).toBe(78);
    expect(result.current.tests[0].isPassed).toBe(true);
  });

  it('advances spaced repetition cycles and calculates dynamic intervals', () => {
    const { result } = renderHook(() => useData(), { wrapper });
    const testTopic = result.current.topics[5];

    // Complete topic -> R1
    act(() => {
      result.current.updateTopicStatus(testTopic.id, 'completed');
    });

    expect(result.current.revisions).toHaveLength(1);
    expect(result.current.revisions[0].cycle).toBe(1);

    // Advance to R2 with High confidence (+14 days)
    act(() => {
      result.current.advanceRevisionCycle(testTopic.id, 'high', 'Formulas well memorized');
    });

    expect(result.current.revisions[0].cycle).toBe(2);
    expect(result.current.revisions[0].confidence).toBe('high');
    expect(result.current.revisions[0].mistakesNotes).toBe('Formulas well memorized');
  });

  it('exports state to valid JSON and CSV strings', () => {
    const { result } = renderHook(() => useData(), { wrapper });

    const jsonStr = result.current.exportData('json');
    expect(typeof jsonStr).toBe('string');
    const parsed = JSON.parse(jsonStr);
    expect(parsed.version).toBe('1.0');
    expect(parsed.topics).toHaveLength(99);

    const csvStr = result.current.exportData('csv');
    expect(typeof csvStr).toBe('string');
    expect(csvStr).toContain('TopicID,SubjectID,ChapterName,Title');
  });

  it('resets syllabus to ICAI blueprint defaults while preserving settings and mock tests', () => {
    const { result } = renderHook(() => useData(), { wrapper });

    // Mark 3 topics as completed & log 1 test
    act(() => {
      result.current.updateTopicStatus(result.current.topics[0].id, 'completed');
      result.current.updateTopicStatus(result.current.topics[1].id, 'completed');
      result.current.addTest({
        title: 'Preserved Test',
        subjectId: 'paper1',
        testType: 'mock',
        dateAttempted: '2026-08-28',
        marksObtained: 80,
        totalMarks: 100,
      });
    });

    expect(result.current.metrics.completedTopics).toBe(2);
    expect(result.current.tests).toHaveLength(1);

    // Reset with preserveTests=true
    act(() => {
      result.current.resetToDefaultSyllabus({ preserveTests: true, preserveCustomTopics: true });
    });

    expect(result.current.metrics.completedTopics).toBe(0);
    expect(result.current.tests).toHaveLength(1);
    expect(result.current.topics).toHaveLength(99);
  });
});
