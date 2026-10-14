import React, { useState, lazy, Suspense } from 'react';
import { ThemeProvider } from '@/context/ThemeContext';
import { AuthProvider } from '@/context/AuthContext';
import { DataProvider } from '@/context/DataContext';
import { AppShell } from '@/components/layout/AppShell';
import { NavigationTab } from '@/types';
import { DashboardView } from '@/components/dashboard/DashboardView';
import { ScheduleView } from '@/components/schedule/ScheduleView';
import { ChecklistView } from '@/components/checklist/ChecklistView';
import { LecturesView } from '@/components/lectures/LecturesView';
import { TestsView } from '@/components/tests/TestsView';
import { RevisionsView } from '@/components/revision/RevisionsView';
import { IngestionView } from '@/components/ingestion/IngestionView';
import { SettingsView } from '@/components/settings/SettingsView';

const ExercisesView = lazy(() =>
  import('@/components/exercises/ExercisesView').then((m) => ({ default: m.ExercisesView }))
);

export const AppContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<NavigationTab>('dashboard');
  const [exerciseTarget, setExerciseTarget] = useState<
    { chapterNumber: number; unitNumber?: number; timestamp: number } | undefined
  >(undefined);

  const handleNavigateToExercise = (chapterNum?: number, unitNum?: number) => {
    if (chapterNum != null) {
      setExerciseTarget({
        chapterNumber: chapterNum,
        unitNumber: unitNum,
        timestamp: Date.now(),
      });
    } else {
      setExerciseTarget(undefined);
    }
    setActiveTab('exercises');
  };

  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardView onNavigate={setActiveTab} />;
      case 'schedule':
        return <ScheduleView />;
      case 'checklist':
        return <ChecklistView onNavigateToExercise={handleNavigateToExercise} />;
      case 'lectures':
        return <LecturesView />;
      case 'tests':
        return <TestsView />;
      case 'revisions':
        return <RevisionsView />;
      case 'exercises':
        return (
          <Suspense
            fallback={
              <div className="flex items-center justify-center min-h-[50vh] text-zinc-500">
                <span className="text-sm font-medium">Loading exercises...</span>
              </div>
            }
          >
            <ExercisesView
              initialChapterNumber={exerciseTarget?.chapterNumber}
              initialUnitNumber={exerciseTarget?.unitNumber}
              navTimestamp={exerciseTarget?.timestamp}
              onClearNavigationTarget={() => setExerciseTarget(undefined)}
            />
          </Suspense>
        );
      case 'ingestion':
        return <IngestionView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <DashboardView onNavigate={setActiveTab} />;
    }
  };

  return (
    <AppShell activeTab={activeTab} onTabChange={setActiveTab}>
      {renderActiveView()}
    </AppShell>
  );
};

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <DataProvider>
          <AppContent />
        </DataProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
