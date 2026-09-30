import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { loadSeedLectures, loadSeedSyllabus } from '@/lib/seedLoader';
import { LecturesView } from '@/components/lectures/LecturesView';
import { DataProvider } from '@/context/DataContext';

// Mock Firebase module to avoid network calls during unit test
vi.mock('@/lib/firebase', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/firebase')>();
  return {
    ...actual,
    saveLectureToFirestore: vi.fn().mockResolvedValue(undefined),
    syncLecturesWithCloud: vi.fn().mockImplementation(async (lectures) => lectures),
    subscribeToUserData: vi.fn().mockImplementation((userId, callbacks) => {
      return () => {};
    }),
  };
});

describe('Lectures Integration & Accounts Google Sheets Mapping', () => {
  it('loads all 33 seeded lectures (19 Accounts + 7 Business Laws + 7 Business Economics) in sequence', () => {
    const lectures = loadSeedLectures();
    expect(lectures).toHaveLength(33);

    const accLectures = lectures.filter((l) => l.subjectId === 'paper1');
    expect(accLectures).toHaveLength(19);

    // Row 1
    expect(accLectures[0].order).toBe(1);
    expect(accLectures[0].title).toContain('Basic of 11th with Journal Entry');
    expect(accLectures[0].uploadDate).toBe('2022-10-15T09:57:17Z');
    expect(accLectures[0].videoUrl).toBe('https://www.youtube.com/watch?v=9vUMhazMkkM');
    expect(accLectures[0].youtubeId).toBe('9vUMhazMkkM');

    // Row 19
    expect(accLectures[18].order).toBe(19);
    expect(accLectures[18].title).toContain('Calculation Of Normal Loss & Abnormal Loss');
    expect(accLectures[18].uploadDate).toBe('2023-02-06T12:01:22Z');
    expect(accLectures[18].videoUrl).toBe('https://www.youtube.com/watch?v=J6MOd20uz0I');

    // Business Laws
    const lawLectures = lectures.filter((l) => l.subjectId === 'paper2');
    expect(lawLectures).toHaveLength(7);

    // Business Economics
    const ecoLectures = lectures.filter((l) => l.subjectId === 'paper4');
    expect(ecoLectures).toHaveLength(7);
  });

  it('maps videoUrl and videoTitle onto Accounts checklist topics in syllabus blueprint', () => {
    const syllabus = loadSeedSyllabus();
    const accTopics = syllabus.topics.filter((t) => t.subjectId === 'paper1');

    // Check Journal Entries topic has videoUrl
    const journalTopic = accTopics.find((t) => t.id === 'acc-top-0201');
    expect(journalTopic).toBeDefined();
    expect(journalTopic?.videoUrl).toBe('https://www.youtube.com/watch?v=9vUMhazMkkM');

    // Check Bank Reconciliation Statement topic has videoUrl
    const brsTopic = accTopics.find((t) => t.id === 'acc-top-0301');
    expect(brsTopic).toBeDefined();
    expect(brsTopic?.videoUrl).toBe('https://www.youtube.com/watch?v=YfK9qV3bU7o');

    // Check Company Accounts Shares topic has videoUrl
    const sharesTopic = accTopics.find((t) => t.id === 'acc-top-1102');
    expect(sharesTopic).toBeDefined();
    expect(sharesTopic?.videoUrl).toBe('https://www.youtube.com/watch?v=3K0s-kL3fYo');
  });

  it('renders LecturesView with all video lectures and allows subject and watch filtering', () => {
    render(
      <DataProvider>
        <LecturesView />
      </DataProvider>
    );

    // Initial All Papers view
    expect(screen.getByText('Video Lectures & Watch History')).toBeInTheDocument();
    expect(screen.getByText('All Papers')).toBeInTheDocument();
    expect(screen.getByText('33 Total Lectures')).toBeInTheDocument();

    // Check presence of Accounts, Business Laws, and Business Economics lectures
    expect(screen.getAllByText(/Basic of 11th with Journal Entry/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Indian Regulatory Framework/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Money Market/i).length).toBeGreaterThan(0);

    // Filter by Subject: Paper 1: Accounting
    const paper1Btn = screen.getByRole('button', { name: /Paper 1: Accounting/i });
    fireEvent.click(paper1Btn);
    expect(screen.getByText('Accounts Lectures')).toBeInTheDocument();
    expect(screen.getAllByText(/Calculation Of Normal Loss & Abnormal Loss/i).length).toBeGreaterThan(0);

    // Filter by Subject: Paper 2: Business Laws
    const paper2Btn = screen.getByRole('button', { name: /Paper 2: Business Laws/i });
    fireEvent.click(paper2Btn);
    expect(screen.getByText('Business Laws Lectures')).toBeInTheDocument();
    expect(screen.getAllByText(/The Sale of Good Act,1930/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/The Negotiable Instruments Act, 1881/i).length).toBeGreaterThan(0);

    // Filter by Subject: Paper 4: Economics
    const paper4Btn = screen.getByRole('button', { name: /Paper 4: Economics/i });
    fireEvent.click(paper4Btn);
    expect(screen.getByText('Business Economics Lectures')).toBeInTheDocument();
    expect(screen.getAllByText(/Theory of Demand and Supply/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Public Finance/i).length).toBeGreaterThan(0);

    // Filter by Unwatched
    const unwatchedBtn = screen.getByRole('button', { name: /Unwatched/i });
    fireEvent.click(unwatchedBtn);
    expect(screen.getAllByText(/Theory of Demand and Supply/i).length).toBeGreaterThan(0);
  });
});
