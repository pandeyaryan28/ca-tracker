import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { DataProvider, useData } from '@/context/DataContext';
import { ImportExportPayload } from '@/types';

const wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <DataProvider>{children}</DataProvider>
);

describe('Adversarial Stress Test: Import/Export & Conflict Resolution Strategies', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('performs lossless JSON export-import roundtrip under overwrite mode', () => {
    const { result } = renderHook(() => useData(), { wrapper });

    act(() => {
      // Modify 3 topics
      result.current.updateTopicStatus(result.current.topics[0].id, 'completed');
      result.current.updateTopicStatus(result.current.topics[1].id, 'in_progress');
      // Add custom topic
      result.current.addTopic({
        subjectId: 'paper2',
        chapterId: 'p2-custom',
        chapterName: 'Custom Chapter',
        title: 'Lossless Export Test Topic',
        status: 'pending',
        estimatedMinutes: 60,
        estimatedHours: 1.0,
      });
      // Add test record
      result.current.addTest({
        title: 'Lossless Export Test',
        subjectId: 'paper1',
        testType: 'mock',
        dateAttempted: '2026-08-28',
        marksObtained: 88,
        totalMarks: 100,
      });
    });

    const exportedJson = result.current.exportData('json');
    const parsedPayload: ImportExportPayload = JSON.parse(exportedJson);

    expect(parsedPayload.topics).toHaveLength(100);
    expect(parsedPayload.tests).toHaveLength(1);
    expect(parsedPayload.metadata?.totalTopics).toBe(100);

    // Reset everything
    act(() => {
      result.current.resetToDefaultSyllabus();
    });
    expect(result.current.topics).toHaveLength(99);
    expect(result.current.tests).toHaveLength(0);

    // Import with overwrite
    act(() => {
      result.current.importData(parsedPayload, 'overwrite');
    });

    expect(result.current.topics).toHaveLength(100);
    expect(result.current.tests).toHaveLength(1);
    expect(result.current.tests[0].title).toBe('Lossless Export Test');
    expect(result.current.topics.find((t) => t.title === 'Lossless Export Test Topic')).toBeDefined();
  });

  it('merges overlapping topic modifications while preserving non-overlapping items', () => {
    const { result } = renderHook(() => useData(), { wrapper });
    const topicIdToUpdate = result.current.topics[0].id;

    // Incoming payload has topic 0 marked completed and 1 new topic
    const payload: ImportExportPayload = {
      version: '1.0',
      appVersion: '1.0.0',
      exportedAt: new Date().toISOString(),
      settings: result.current.settings,
      topics: [
        {
          ...result.current.topics[0],
          status: 'completed',
          completedAt: '2026-08-28T12:00:00.000Z',
        },
        {
          id: 'imported-custom-topic-1',
          subjectId: 'paper3',
          chapterId: 'p3-custom',
          chapterName: 'Custom Ingestion',
          title: 'Brand New Imported Topic',
          status: 'pending',
          estimatedMinutes: 45,
          estimatedHours: 0.8,
          order: 999,
        },
      ],
      revisions: [],
      tests: [],
    };

    act(() => {
      result.current.importData(payload, 'merge');
    });

    // Total topics should now be 99 + 1 = 100
    expect(result.current.topics).toHaveLength(100);
    const updated = result.current.topics.find((t) => t.id === topicIdToUpdate);
    expect(updated?.status).toBe('completed');
    const brandNew = result.current.topics.find((t) => t.id === 'imported-custom-topic-1');
    expect(brandNew).toBeDefined();
  });

  it('skips conflicting duplicate IDs in skip mode without overwriting existing data', () => {
    const { result } = renderHook(() => useData(), { wrapper });
    const targetTopicId = result.current.topics[0].id;

    // Local state is in_progress
    act(() => {
      result.current.updateTopicStatus(targetTopicId, 'in_progress');
    });

    // Incoming payload tries to overwrite with 'completed'
    const payload: ImportExportPayload = {
      version: '1.0',
      appVersion: '1.0.0',
      exportedAt: new Date().toISOString(),
      settings: result.current.settings,
      topics: [
        {
          ...result.current.topics[0],
          status: 'completed',
        },
        {
          id: 'non-conflicting-topic-2',
          subjectId: 'paper4',
          chapterId: 'p4-custom',
          chapterName: 'Economics Ingest',
          title: 'Non Conflicting Economics Topic',
          status: 'pending',
          estimatedMinutes: 50,
          estimatedHours: 0.8,
          order: 1000,
        },
      ],
      revisions: [],
      tests: [],
    };

    act(() => {
      result.current.importData(payload, 'skip');
    });

    // Target topic should retain local 'in_progress' status
    const target = result.current.topics.find((t) => t.id === targetTopicId);
    expect(target?.status).toBe('in_progress');

    // New non-conflicting topic should be appended
    expect(result.current.topics).toHaveLength(100);
    expect(result.current.topics.find((t) => t.id === 'non-conflicting-topic-2')).toBeDefined();
  });

  it('exports valid formatted CSV with quoted strings and special character escaping', () => {
    const { result } = renderHook(() => useData(), { wrapper });

    act(() => {
      result.current.addTopic({
        subjectId: 'paper2',
        chapterId: 'paper2-ch1',
        chapterName: 'Law, Section "A"',
        title: 'Special "Quoted, Title" & Notes\nNewline',
        status: 'pending',
        estimatedMinutes: 60,
        estimatedHours: 1.0,
      });
    });

    const csvOutput = result.current.exportData('csv');
    expect(csvOutput).toContain('TopicID,SubjectID,ChapterName,Title,Status,EstimatedHours,TargetDate,StartedAt,CompletedAt');
    expect(csvOutput).toContain('"Law, Section ""A"""');
    expect(csvOutput).toContain('"Special ""Quoted, Title"" & Notes\nNewline"');
  });
});
