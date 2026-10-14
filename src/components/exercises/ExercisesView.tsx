import React, { useState, useEffect } from 'react';
import {
  ChapterExercise,
  ChapterExerciseUnit,
  ExerciseMode,
  ExerciseAttempt,
  ExerciseQuestion,
} from '@/types';
import { getChapterByNumber } from '@/lib/exerciseStorage';
import { ChapterExerciseHub } from './ChapterExerciseHub';
import { ExerciseSessionView } from './ExerciseSessionView';
import { CrossVerificationReview } from './CrossVerificationReview';

interface ExercisesViewProps {
  initialChapterNumber?: number;
  initialUnitNumber?: number;
  navTimestamp?: number;
  onClearNavigationTarget?: () => void;
}

export const ExercisesView: React.FC<ExercisesViewProps> = ({
  initialChapterNumber,
  initialUnitNumber,
  navTimestamp,
  onClearNavigationTarget,
}) => {
  const [currentView, setCurrentView] = useState<'hub' | 'session' | 'review'>('hub');
  const [selectedChapter, setSelectedChapter] = useState<ChapterExercise | null>(null);
  const [selectedUnit, setSelectedUnit] = useState<ChapterExerciseUnit | null>(null);
  const [sessionMode, setSessionMode] = useState<ExerciseMode>('exam');
  const [sessionQuestions, setSessionQuestions] = useState<ExerciseQuestion[]>([]);
  const [activeAttempt, setActiveAttempt] = useState<ExerciseAttempt | null>(null);

  const [isCustomPractice, setIsCustomPractice] = useState(false);

  // Handle direct navigation from Checklist or other views
  useEffect(() => {
    if (initialChapterNumber) {
      const ch = getChapterByNumber(initialChapterNumber);
      if (ch) {
        setSelectedChapter(ch);
        setIsCustomPractice(false);
        if (initialUnitNumber && ch.hasUnits) {
          const unit = ch.units.find((u) => u.unitNumber === initialUnitNumber);
          if (unit) {
            setSelectedUnit(unit);
            const unitQuestions = ch.questions.filter(
              (q) => q.unitNumberInChapter === initialUnitNumber
            );
            setSessionQuestions(unitQuestions);
            setCurrentView('session');
            return;
          }
        }
        setSelectedUnit(null);
        setSessionQuestions(ch.questions);
        setCurrentView('session');
      }
    }
  }, [initialChapterNumber, initialUnitNumber, navTimestamp]);

  const handleStartSession = (
    chapter: ChapterExercise,
    mode: ExerciseMode,
    unit?: ChapterExerciseUnit | null
  ) => {
    setSelectedChapter(chapter);
    setSelectedUnit(unit ?? null);
    setSessionMode(mode);
    setIsCustomPractice(false);

    let questionsToPractice = chapter.questions;
    if (unit) {
      questionsToPractice = chapter.questions.filter(
        (q) => q.unitNumberInChapter === unit.unitNumber
      );
    }

    setSessionQuestions(questionsToPractice);
    setCurrentView('session');
  };

  const handleSessionComplete = (attempt: ExerciseAttempt) => {
    setActiveAttempt(attempt);
    setCurrentView('review');
  };

  const handleRetake = (customQuestions?: ExerciseQuestion[]) => {
    if (customQuestions && customQuestions.length > 0) {
      setSessionQuestions(customQuestions);
      setSessionMode('practice');
      setIsCustomPractice(true);
      setCurrentView('session');
    } else if (selectedChapter) {
      setIsCustomPractice(false);
      handleStartSession(selectedChapter, sessionMode, selectedUnit);
    }
  };

  const handleReviewAttempt = (attempt: ExerciseAttempt, chapter: ChapterExercise) => {
    setSelectedChapter(chapter);
    setActiveAttempt(attempt);

    let questions = chapter.questions;
    if (attempt.unitNumber != null) {
      questions = chapter.questions.filter(
        (q) => q.unitNumberInChapter === attempt.unitNumber
      );
      const unit = chapter.units.find((u) => u.unitNumber === attempt.unitNumber);
      setSelectedUnit(unit ?? null);
    } else {
      setSelectedUnit(null);
    }

    setSessionQuestions(questions);
    setCurrentView('review');
  };

  const handleBackToHub = () => {
    setCurrentView('hub');
    setActiveAttempt(null);
    setSelectedChapter(null);
    setSelectedUnit(null);
    setIsCustomPractice(false);
    onClearNavigationTarget?.();
  };

  if (currentView === 'session' && selectedChapter) {
    return (
      <ExerciseSessionView
        chapterNumber={selectedChapter.chapterNumber}
        chapterId={selectedChapter.chapterId}
        chapterTitle={selectedChapter.title}
        unitNumber={selectedUnit?.unitNumber}
        unitTitle={selectedUnit?.unitTitle}
        mode={sessionMode}
        questions={sessionQuestions}
        isCustomSubset={isCustomPractice}
        onComplete={handleSessionComplete}
        onExit={handleBackToHub}
      />
    );
  }

  if (currentView === 'review' && activeAttempt && selectedChapter) {
    return (
      <CrossVerificationReview
        attempt={activeAttempt}
        questions={sessionQuestions}
        onRetake={handleRetake}
        onBackToHub={handleBackToHub}
      />
    );
  }

  return (
    <ChapterExerciseHub
      onStartSession={handleStartSession}
      onReviewAttempt={handleReviewAttempt}
    />
  );
};
