import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ExerciseSessionView } from '@/components/exercises/ExerciseSessionView';
import { CrossVerificationReview } from '@/components/exercises/CrossVerificationReview';
import { ChapterExerciseHub } from '@/components/exercises/ChapterExerciseHub';
import { QuestionPalette } from '@/components/exercises/QuestionPalette';
import { ExerciseQuestion, ExerciseAttempt } from '@/types';
import { DataProvider } from '@/context/DataContext';

const sampleQuestions: ExerciseQuestion[] = [
  {
    id: 'beco-ch01-q001',
    chapterNumber: 1,
    chapterId: 'eco-ch-01',
    chapterTitle: 'Nature & Scope of Business Economics',
    questionNumber: 1,
    questionText: 'Economists regard decision making as important because:',
    options: [
      { key: 'a', text: 'The resources required to satisfy our wants are finite.' },
      { key: 'b', text: 'It is crucial to understand allocation of scarce resources.' },
      { key: 'c', text: 'Resources have alternative uses.' },
      { key: 'd', text: 'All the above.' },
    ],
    correctOption: 'd',
    explanation: 'Decision making arises because resources are scarce and have alternative uses, making all above choices valid.',
  },
  {
    id: 'beco-ch01-q002',
    chapterNumber: 1,
    chapterId: 'eco-ch-01',
    chapterTitle: 'Nature & Scope of Business Economics',
    questionNumber: 2,
    questionText: 'Business Economics is defined as:',
    options: [
      { key: 'a', text: 'Abstract and purely theoretical.' },
      { key: 'b', text: 'Practical application of economic theory in business decision making.' },
      { key: 'c', text: 'A tool unrelated to managerial decisions.' },
      { key: 'd', text: 'None of the above.' },
    ],
    correctOption: 'b',
    explanation: 'Business economics bridges economic theory with business practice for managerial decision making.',
  },
];

describe('Exercise Session Flow and UI Interactions', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders ExerciseSessionView and allows option selection and mark for review', () => {
    const handleComplete = vi.fn();
    const handleExit = vi.fn();

    render(
      <ExerciseSessionView
        chapterNumber={1}
        chapterId="eco-ch-01"
        chapterTitle="Nature & Scope of Business Economics"
        mode="practice"
        questions={sampleQuestions}
        onComplete={handleComplete}
        onExit={handleExit}
      />
    );

    // Initial render displays Question 1
    expect(screen.getByText(/Economists regard decision making as important because:/i)).toBeInTheDocument();
    expect(screen.getByText(/Question 1/i)).toBeInTheDocument();

    // Option selection
    const optionD = screen.getByText(/All the above\./i);
    fireEvent.click(optionD);

    // Click Mark for Review
    const markButton = screen.getByRole('button', { name: /Mark for Review/i });
    fireEvent.click(markButton);

    // Now it should show Marked for Review state on the button
    expect(screen.getByRole('button', { name: /Marked for Review/i })).toBeInTheDocument();
    expect(screen.getAllByText(/Marked for Review/i).length).toBeGreaterThanOrEqual(1);

    // Practice mode "Check Answer" feature reveals explanation
    const checkAnswerBtn = screen.getByRole('button', { name: /Check Answer & Explanation/i });
    fireEvent.click(checkAnswerBtn);

    // Verify explanation and solution appears
    expect(screen.getByText(/Correct Answer!/i)).toBeInTheDocument();
    expect(screen.getByText(/Decision making arises because resources are scarce/i)).toBeInTheDocument();

    // Navigate to Next question
    const nextBtn = screen.getByRole('button', { name: /Next/i });
    fireEvent.click(nextBtn);

    expect(screen.getByText(/Business Economics is defined as:/i)).toBeInTheDocument();
    expect(screen.getByText(/Question 2/i)).toBeInTheDocument();
  });

  it('renders CrossVerificationReview with visible marked-for-review status and solution explanations', () => {
    const mockAttempt: ExerciseAttempt = {
      id: 'attempt-test-1',
      chapterNumber: 1,
      chapterId: 'eco-ch-01',
      chapterTitle: 'Nature & Scope of Business Economics',
      mode: 'exam',
      startedAt: '2026-10-14T06:00:00Z',
      completedAt: '2026-10-14T06:02:00Z',
      timeSpentSeconds: 120,
      selectedAnswers: {
        'beco-ch01-q001': 'd', // correct
        'beco-ch01-q002': 'a', // incorrect (correct is b)
      },
      markedForReview: {
        'beco-ch01-q001': true, // Q1 was marked for review!
      },
      score: 1,
      scaledScore: 0.75, // 1 - 0.25 = 0.75
      totalQuestions: 2,
      attemptedCount: 2,
      correctCount: 1,
      incorrectCount: 1,
      unattemptedCount: 0,
      accuracyPercentage: 50,
    };

    const handleRetake = vi.fn();
    const handleBackToHub = vi.fn();

    render(
      <DataProvider>
        <CrossVerificationReview
          attempt={mockAttempt}
          questions={sampleQuestions}
          onRetake={handleRetake}
          onBackToHub={handleBackToHub}
        />
      </DataProvider>
    );

    // Verify scores are visible
    expect(screen.getByText(/0.75/i)).toBeInTheDocument();
    expect(screen.getByText(/50%/i)).toBeInTheDocument();

    // VISIBLY MARKED FOR REVIEW: Verify "Marked for Review" badge is displayed
    const markedBadges = screen.getAllByText(/Marked for Review/i);
    expect(markedBadges.length).toBeGreaterThan(0);

    // Verify dedicated "Marked for Review" filter tab exists
    const markedFilterTab = screen.getByRole('button', { name: /Filter: Marked for Review/i });
    expect(markedFilterTab).toBeInTheDocument();

    // Verify one-click subset practice buttons exist
    expect(screen.getByRole('button', { name: /Practice Marked Only \(1\)/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Practice Incorrect Only \(1\)/i })).toBeInTheDocument();

    // Verify explanation and solution appears
    expect(screen.getByText(/Decision making arises because resources are scarce/i)).toBeInTheDocument();
    expect(screen.getByText(/Business economics bridges economic theory with business practice/i)).toBeInTheDocument();

    // Filter by Marked for Review
    fireEvent.click(markedFilterTab);

    // Q1 should be visible (since it was marked)
    expect(screen.getByText(/Economists regard decision making as important because:/i)).toBeInTheDocument();

    // Q2 should NOT be visible when filtered by marked
    expect(screen.queryByText(/Business Economics is defined as:/i)).not.toBeInTheDocument();

    // Toggle marked for review on Q1 from the review screen
    const toggleMarkBtn = screen.getByRole('button', { name: /Unmark question from review/i });
    fireEvent.click(toggleMarkBtn);

    // After unmarking, marked filter shows 0 questions matching
    expect(screen.getByText(/No questions found matching the/i)).toBeInTheDocument();
  });

  it('renders ChapterExerciseHub with multi-unit practice capabilities', () => {
    const handleStartSession = vi.fn();
    const handleReviewAttempt = vi.fn();

    render(
      <ChapterExerciseHub
        onStartSession={handleStartSession}
        onReviewAttempt={handleReviewAttempt}
      />
    );

    // Check that Chapter 7 (Public Finance) displays multi-unit selector
    expect(screen.getByText(/Public Finance/i)).toBeInTheDocument();
    expect(screen.getByText(/4 Units/i)).toBeInTheDocument();

    // Start session in exam mode
    const examButtons = screen.getAllByRole('button', { name: /Exam Mode/i });
    expect(examButtons.length).toBe(10); // 10 chapters

    fireEvent.click(examButtons[0]);
    expect(handleStartSession).toHaveBeenCalled();
  });

  it('displays Retake Unit Exercise for unit attempts and Retake Full Chapter for chapter attempts', () => {
    const unitAttempt: ExerciseAttempt = {
      id: 'unit-att-1',
      chapterNumber: 7,
      chapterId: 'eco-ch-07',
      chapterTitle: 'Public Finance',
      unitNumber: 2,
      unitTitle: 'Unit 2: Market Failure',
      mode: 'practice',
      startedAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
      timeSpentSeconds: 60,
      selectedAnswers: { 'beco-ch01-q001': 'd' },
      markedForReview: {},
      score: 1,
      scaledScore: 1.0,
      totalQuestions: 1,
      attemptedCount: 1,
      correctCount: 1,
      incorrectCount: 0,
      unattemptedCount: 0,
      accuracyPercentage: 100,
    };

    render(
      <DataProvider>
        <CrossVerificationReview
          attempt={unitAttempt}
          questions={[sampleQuestions[0]]}
          onRetake={vi.fn()}
          onBackToHub={vi.fn()}
        />
      </DataProvider>
    );

    expect(screen.getByRole('button', { name: /Retake Unit Exercise/i })).toBeInTheDocument();
  });

  it('jumps to question from palette even when filtered out by resetting filter to all', () => {
    const mockAttempt: ExerciseAttempt = {
      id: 'attempt-jump-test',
      chapterNumber: 1,
      chapterId: 'eco-ch-01',
      chapterTitle: 'Nature & Scope of Business Economics',
      mode: 'exam',
      startedAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
      timeSpentSeconds: 100,
      selectedAnswers: {
        'beco-ch01-q001': 'd', // correct
        'beco-ch01-q002': 'a', // incorrect
      },
      markedForReview: {},
      score: 1,
      scaledScore: 0.75,
      totalQuestions: 2,
      attemptedCount: 2,
      correctCount: 1,
      incorrectCount: 1,
      unattemptedCount: 0,
      accuracyPercentage: 50,
    };

    render(
      <DataProvider>
        <CrossVerificationReview
          attempt={mockAttempt}
          questions={sampleQuestions}
          onRetake={vi.fn()}
          onBackToHub={vi.fn()}
        />
      </DataProvider>
    );

    // Filter by incorrect (only Q2 is visible, Q1 is hidden)
    const incorrectFilter = screen.getByRole('button', { name: /Filter: Incorrect/i });
    fireEvent.click(incorrectFilter);

    expect(screen.queryByText(/Economists regard decision making as important because:/i)).not.toBeInTheDocument();

    // Now click Question 1 button in palette matrix
    const q1PaletteBtn = screen.getByRole('button', { name: /Jump to question 1/i });
    fireEvent.click(q1PaletteBtn);

    // Q1 should now be restored to DOM
    expect(screen.getByText(/Economists regard decision making as important because:/i)).toBeInTheDocument();
  });

  it('supports full keyboard navigation: 1-4/A-D for options, M for review, arrows for navigation, backspace to clear', () => {
    const handleComplete = vi.fn();
    const handleExit = vi.fn();

    render(
      <ExerciseSessionView
        chapterNumber={1}
        chapterId="eco-ch-01"
        chapterTitle="Nature & Scope of Business Economics"
        mode="practice"
        questions={sampleQuestions}
        onComplete={handleComplete}
        onExit={handleExit}
      />
    );

    // Initial question 1
    expect(screen.getByText(/Economists regard decision making as important because:/i)).toBeInTheDocument();

    // Press '4' key -> selects option D
    fireEvent.keyDown(window, { key: '4' });
    // Verify checkmark appears for option D
    const optionD = screen.getByText(/All the above\./i).closest('button');
    expect(optionD?.className).toContain('border-zinc-900');

    // Press 'm' key -> toggles marked for review
    fireEvent.keyDown(window, { key: 'm' });
    expect(screen.getByRole('button', { name: /Marked for Review/i })).toBeInTheDocument();

    // Press 'backspace' -> clears selection
    fireEvent.keyDown(window, { key: 'backspace' });
    expect(optionD?.className).not.toContain('border-zinc-900');

    // Press 'c' with no selection -> selects option C
    fireEvent.keyDown(window, { key: 'c' });
    const optionC = screen.getByText(/Resources have alternative uses\./i).closest('button');
    expect(optionC?.className).toContain('border-zinc-900');

    // Press 'c' with option C selected -> clears selection
    fireEvent.keyDown(window, { key: 'c' });
    expect(optionC?.className).not.toContain('border-zinc-900');

    // Press 'b' key -> selects option B
    fireEvent.keyDown(window, { key: 'b' });
    const optionB = screen.getByText(/It is crucial to understand allocation of scarce resources\./i).closest('button');
    expect(optionB?.className).toContain('border-zinc-900');

    // Press 'c' with option B selected -> clears selection
    fireEvent.keyDown(window, { key: 'c' });
    expect(optionB?.className).not.toContain('border-zinc-900');

    // Re-select option B
    fireEvent.keyDown(window, { key: 'b' });
    expect(optionB?.className).toContain('border-zinc-900');

    // Press ArrowRight -> moves to Question 2
    fireEvent.keyDown(window, { key: 'ArrowRight' });
    expect(screen.getByText(/Business Economics is defined as:/i)).toBeInTheDocument();

    // Press ArrowLeft -> moves back to Question 1
    fireEvent.keyDown(window, { key: 'ArrowLeft' });
    expect(screen.getByText(/Economists regard decision making as important because:/i)).toBeInTheDocument();
  });

  it('renders QuestionPalette with 2x2 filters, embedded metric strip, and review mode toggle', () => {
    const handleSelect = vi.fn();

    const { rerender } = render(
      <QuestionPalette
        questions={sampleQuestions}
        currentIndex={0}
        selectedAnswers={{ 'beco-ch01-q001': 'd' }}
        markedForReview={{ 'beco-ch01-q001': true }}
        onSelectQuestion={handleSelect}
        isReviewMode={false}
      />
    );

    // Verify filter buttons exist
    expect(screen.getByRole('button', { name: /Answered \(1\)/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Marked \(1\)/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Pending \(1\)/i })).toBeInTheDocument();

    // Verify footer stats
    expect(screen.getAllByText('Answered').length).toBeGreaterThanOrEqual(2);
    expect(screen.getByText('Pending')).toBeInTheDocument();

    // In review mode, session footer is hidden
    rerender(
      <QuestionPalette
        questions={sampleQuestions}
        currentIndex={0}
        selectedAnswers={{ 'beco-ch01-q001': 'd' }}
        markedForReview={{}}
        onSelectQuestion={handleSelect}
        isReviewMode={true}
      />
    );
    expect(screen.queryByText('Pending')).not.toBeInTheDocument();
  });
});

