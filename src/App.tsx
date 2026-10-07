import React, { useState } from 'react';
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

export const AppContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<NavigationTab>('dashboard');

  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardView onNavigate={setActiveTab} />;
      case 'schedule':
        return <ScheduleView />;
      case 'checklist':
        return <ChecklistView />;
      case 'lectures':
        return <LecturesView />;
      case 'tests':
        return <TestsView />;
      case 'revisions':
        return <RevisionsView />;
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
