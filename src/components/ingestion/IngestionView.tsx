import React, { useState, useRef } from 'react';
import {
  Download,
  Upload,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  FileCode,
  FileSpreadsheet,
} from 'lucide-react';
import { useData } from '@/context/DataContext';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { ImportConflictResolution, ResetSyllabusOptions, Topic, SubjectId, TopicStatus } from '@/types';
import { normalizeSubjectId } from '@/lib/seedLoader';

/**
 * Robust RFC-4180 compliant CSV line parser supporting quotes and commas
 */
function parseCSVRow(rowStr: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < rowStr.length; i++) {
    const char = rowStr[i];
    const nextChar = rowStr[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        // Escaped quote
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

export const IngestionView: React.FC = () => {
  const { topics, chapters, exportData, resetToDefaultSyllabus, importData, settings } =
    useData();
  const [importMode, setImportMode] = useState<ImportConflictResolution>('merge');
  const [importFormat, setImportFormat] = useState<'json' | 'csv'>('json');
  const [importText, setImportText] = useState('');
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(
    null
  );

  // Reset confirmation modal state
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetOptions, setResetOptions] = useState<ResetSyllabusOptions>({
    preserveCustomTopics: true,
    preserveTests: true,
    preserveRevisions: true,
    preserveSettings: true,
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDownloadJSON = () => {
    const dataStr = exportData('json');
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ca-foundation-tracker-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadCSV = () => {
    const dataStr = exportData('csv');
    const blob = new Blob([dataStr], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ca-foundation-syllabus-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadTemplate = () => {
    const sampleCsv = `TopicID,SubjectID,ChapterName,Title,Status,EstimatedHours,TargetDate\n` +
      `acc-sample-01,paper1,"Theoretical Framework","Meaning and Scope of Accounting",pending,1.5,2026-09-01\n` +
      `law-sample-01,paper2,"Indian Contract Act, 1872","Offer and Acceptance Essentials",pending,2.0,2026-09-03\n` +
      `qa-sample-01,paper3,"Ratio and Proportion","Properties of Ratios and Proportions",pending,1.0,2026-09-05\n` +
      `eco-sample-01,paper4,"Theory of Demand","Law of Demand and Price Elasticity",pending,1.5,2026-09-07\n`;

    const blob = new Blob([sampleCsv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ca-foundation-schedule-template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleConfirmReset = () => {
    resetToDefaultSyllabus(resetOptions);
    setShowResetModal(false);
    setStatusMessage({
      type: 'success',
      text: 'Syllabus successfully reset to official ICAI blueprint!',
    });
    setTimeout(() => setStatusMessage(null), 3500);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isCsv = file.name.endsWith('.csv');
    setImportFormat(isCsv ? 'csv' : 'json');

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setImportText(content);
      }
    };
    reader.readAsText(file);
  };

  const handleProcessImport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!importText.trim()) return;

    try {
      if (importFormat === 'json') {
        const parsed = JSON.parse(importText);
        if (!parsed || typeof parsed !== 'object') {
          throw new Error('Invalid JSON format');
        }
        importData(parsed, importMode);
        setStatusMessage({ type: 'success', text: 'JSON data imported successfully!' });
        setImportText('');
        setTimeout(() => setStatusMessage(null), 3500);
      } else {
        // CSV Ingestion
        const lines = importText.split(/\r?\n/).filter((l) => l.trim().length > 0);
        if (lines.length < 2) {
          throw new Error('CSV must contain a header and at least one row');
        }

        const headerCols = parseCSVRow(lines[0]).map((h) => h.toLowerCase().replace(/[^a-z0-9]/g, ''));
        const idIdx = headerCols.findIndex((h) => h.includes('topicid') || h === 'id');
        const subIdx = headerCols.findIndex((h) => h.includes('subject'));
        const chIdx = headerCols.findIndex((h) => h.includes('chapter'));
        const titleIdx = headerCols.findIndex(
          (h) => h === 'title' || h.includes('topictitle') || h.includes('topicname') || (h.includes('title') && !h.includes('chapter'))
        );
        const statusIdx = headerCols.findIndex((h) => h.includes('status'));
        const hoursIdx = headerCols.findIndex((h) => h.includes('hour') || h.includes('estimate'));
        const dateIdx = headerCols.findIndex((h) => h.includes('date') || h.includes('target'));

        const parsedTopics: Topic[] = [];

        for (let i = 1; i < lines.length; i++) {
          const cols = parseCSVRow(lines[i]);
          if (cols.length === 0 || !cols[0]) continue;

          const rawId = idIdx >= 0 ? cols[idIdx] : `csv-topic-${Date.now()}-${i}`;
          const rawSub = subIdx >= 0 ? cols[subIdx] : 'paper1';
          const subjectId: SubjectId = normalizeSubjectId(rawSub);
          const chapterName = chIdx >= 0 && cols[chIdx] ? cols[chIdx] : 'Custom Schedule';
          const title = titleIdx >= 0 && cols[titleIdx] ? cols[titleIdx] : `Topic ${i}`;
          const rawStatus = (statusIdx >= 0 ? cols[statusIdx] : 'pending').toLowerCase();
          const status: TopicStatus =
            rawStatus === 'completed' || rawStatus === 'in_progress' ? rawStatus : 'pending';
          const hours = hoursIdx >= 0 ? parseFloat(cols[hoursIdx]) || 1.0 : 1.0;
          const targetDate = dateIdx >= 0 && cols[dateIdx] ? cols[dateIdx] : undefined;

          parsedTopics.push({
            id: rawId,
            subjectId,
            chapterId: `${subjectId}-custom-${chapterName.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
            chapterName,
            title,
            status,
            estimatedHours: Math.max(0.1, hours),
            estimatedMinutes: Math.round(Math.max(0.1, hours) * 60),
            targetDate,
            order: i,
            isCustom: true,
          });
        }

        importData(
          {
            version: '1.0',
            appVersion: '1.0.0',
            exportedAt: new Date().toISOString(),
            settings,
            topics: parsedTopics,
            revisions: [],
            tests: [],
          },
          importMode
        );

        setStatusMessage({
          type: 'success',
          text: `Successfully ingested ${parsedTopics.length} topics from CSV (${importMode} mode)!`,
        });
        setImportText('');
        setTimeout(() => setStatusMessage(null), 3500);
      }
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: `Import failed: ${err?.message || 'Please verify the payload syntax.'}`,
      });
      setTimeout(() => setStatusMessage(null), 5000);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
          Schedule Ingestion & Data Management Hub
        </h2>
        <p className="text-xs text-zinc-500">
          Export backup archives, ingest coaching schedules via CSV/JSON, or restore the official
          ICAI 4-paper syllabus blueprint.
        </p>
      </div>

      {statusMessage && (
        <div
          className={`p-3.5 rounded-xl text-xs flex items-center gap-2 border ${
            statusMessage.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200'
              : 'bg-red-50 dark:bg-red-950/60 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200'
          }`}
        >
          {statusMessage.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0" />
          )}
          <span className="font-medium">{statusMessage.text}</span>
        </div>
      )}

      {/* Blueprint Statistics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="space-y-1">
          <span className="text-xs text-zinc-500 font-medium">Official Papers</span>
          <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 tabular-nums">4</div>
          <span className="text-[11px] text-zinc-400">ACC, BLAW, QA, BECO</span>
        </Card>

        <Card className="space-y-1">
          <span className="text-xs text-zinc-500 font-medium">Total Chapters</span>
          <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 tabular-nums">
            {chapters.length}
          </div>
          <span className="text-[11px] text-zinc-400">Across 4 Papers</span>
        </Card>

        <Card className="space-y-1">
          <span className="text-xs text-zinc-500 font-medium">Active Topics</span>
          <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 tabular-nums">
            {topics.length}
          </div>
          <span className="text-[11px] text-zinc-400">
            {topics.filter((t) => t.isCustom).length} custom added
          </span>
        </Card>

        <Card className="space-y-1">
          <span className="text-xs text-zinc-500 font-medium">Completed Topics</span>
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
            {topics.filter((t) => t.status === 'completed').length}
          </div>
          <span className="text-[11px] text-zinc-400">
            {((topics.filter((t) => t.status === 'completed').length / Math.max(1, topics.length)) * 100).toFixed(0)}% completion
          </span>
        </Card>
      </div>

      {/* Export & Reset Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="space-y-4">
          <div className="flex items-center gap-2">
            <Download className="w-5 h-5 text-zinc-700 dark:text-zinc-300" />
            <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100">
              Export Backup Archives
            </h3>
          </div>
          <p className="text-xs text-zinc-500">
            Export your preparation state, topic progress, test series records, and spaced revision
            plans as JSON or RFC-4180 compliant CSV.
          </p>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3 pt-2">
            <Button
              size="sm"
              variant="secondary"
              leftIcon={<FileCode className="w-4 h-4" />}
              onClick={handleDownloadJSON}
              className="touch-target min-h-[38px]"
            >
              Export JSON
            </Button>
            <Button
              size="sm"
              variant="secondary"
              leftIcon={<FileSpreadsheet className="w-4 h-4" />}
              onClick={handleDownloadCSV}
              className="touch-target min-h-[38px]"
            >
              Export CSV
            </Button>
            <Button
              size="sm"
              variant="outline"
              leftIcon={<Download className="w-4 h-4" />}
              onClick={handleDownloadTemplate}
              className="touch-target min-h-[38px]"
            >
              Sample CSV Template
            </Button>
          </div>
        </Card>

        <Card className="space-y-4">
          <div className="flex items-center gap-2">
            <RefreshCw className="w-5 h-5 text-amber-500" />
            <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100">
              Restore Official Blueprint
            </h3>
          </div>
          <p className="text-xs text-zinc-500">
            Restore all 4 papers, 46 chapters, and 99 units/chapters to the authoritative ICAI scheme (May 2026 onwards). You can
            selectively preserve your custom topics, mock tests, and settings.
          </p>
          <div className="pt-2">
            <Button
              size="sm"
              variant="danger"
              leftIcon={<RefreshCw className="w-4 h-4" />}
              onClick={() => setShowResetModal(true)}
              className="touch-target min-h-[38px]"
            >
              Reset to ICAI Blueprint...
            </Button>
          </div>
        </Card>
      </div>

      {/* Ingestion & Import Panel */}
      <Card className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Upload className="w-5 h-5 text-zinc-700 dark:text-zinc-300" />
            <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100">
              Schedule & Backup Ingestion Engine
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".json,.csv"
              className="hidden"
            />
            <Button
              size="sm"
              variant="secondary"
              leftIcon={<Upload className="w-4 h-4" />}
              onClick={() => fileInputRef.current?.click()}
              className="touch-target min-h-[38px] w-full sm:w-auto"
            >
              Upload File (.json / .csv)
            </Button>
          </div>
        </div>

        <form onSubmit={handleProcessImport} className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 bg-zinc-50 dark:bg-zinc-900/60 p-3 rounded-xl border border-zinc-200/60 dark:border-zinc-800/60">
            {/* Format Selector */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-zinc-500 font-medium">Payload Format:</span>
              <div className="flex items-center gap-1">
                {(['json', 'csv'] as const).map((fmt) => (
                  <button
                    key={fmt}
                    type="button"
                    onClick={() => setImportFormat(fmt)}
                    className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-colors touch-target min-h-[32px] ${
                      importFormat === fmt
                        ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 font-semibold'
                        : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                    }`}
                  >
                    {fmt.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* Conflict Resolution Mode */}
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-xs text-zinc-500 font-medium">Conflict Resolution:</span>
              {(['merge', 'overwrite', 'skip'] as const).map((mode) => (
                <label
                  key={mode}
                  className="inline-flex items-center gap-1.5 text-xs text-zinc-700 dark:text-zinc-300 cursor-pointer touch-target min-h-[32px]"
                >
                  <input
                    type="radio"
                    name="importMode"
                    value={mode}
                    checked={importMode === mode}
                    onChange={() => setImportMode(mode)}
                    className="accent-zinc-900 dark:accent-zinc-100"
                  />
                  <span className="capitalize">{mode}</span>
                </label>
              ))}
            </div>
          </div>

          <textarea
            placeholder={`Paste exported ${importFormat.toUpperCase()} payload here or click "Upload File"...`}
            value={importText}
            onChange={(e) => setImportText(e.target.value)}
            rows={6}
            className="w-full p-3 text-xs font-mono rounded-xl bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-500"
          />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <span className="text-xs text-zinc-400">
              {importFormat === 'csv'
                ? 'Expected CSV Headers: TopicID, SubjectID, ChapterName, Title, Status, EstimatedHours, TargetDate'
                : 'JSON structure supports full application state backup restoration.'}
            </span>

            <Button
              type="submit"
              size="sm"
              variant="primary"
              disabled={!importText.trim()}
              leftIcon={<Upload className="w-4 h-4" />}
              className="touch-target min-h-[38px] w-full sm:w-auto"
            >
              Process Ingestion
            </Button>
          </div>
        </form>
      </Card>

      {/* Reset Confirmation Modal */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <Card className="w-full max-w-md p-6 space-y-4">
            <div className="flex items-center gap-2">
              <RefreshCw className="w-5 h-5 text-amber-500" />
              <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                Confirm ICAI Syllabus Reset
              </h3>
            </div>
            <p className="text-xs text-zinc-500">
              This will restore all 99 units/chapters to their default pending state. Select which items
              you wish to preserve:
            </p>

            <div className="space-y-2.5 pt-1">
              <label className="flex items-center gap-2 text-xs text-zinc-700 dark:text-zinc-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={resetOptions.preserveCustomTopics}
                  onChange={(e) =>
                    setResetOptions((prev) => ({ ...prev, preserveCustomTopics: e.target.checked }))
                  }
                  className="w-4 h-4 rounded accent-zinc-900 dark:accent-zinc-100"
                />
                <span>Preserve user-created custom topics</span>
              </label>

              <label className="flex items-center gap-2 text-xs text-zinc-700 dark:text-zinc-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={resetOptions.preserveTests}
                  onChange={(e) =>
                    setResetOptions((prev) => ({ ...prev, preserveTests: e.target.checked }))
                  }
                  className="w-4 h-4 rounded accent-zinc-900 dark:accent-zinc-100"
                />
                <span>Preserve mock test logs & performance analytics</span>
              </label>

              <label className="flex items-center gap-2 text-xs text-zinc-700 dark:text-zinc-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={resetOptions.preserveRevisions}
                  onChange={(e) =>
                    setResetOptions((prev) => ({ ...prev, preserveRevisions: e.target.checked }))
                  }
                  className="w-4 h-4 rounded accent-zinc-900 dark:accent-zinc-100"
                />
                <span>Preserve spaced revision cycles & mistake notes</span>
              </label>

              <label className="flex items-center gap-2 text-xs text-zinc-700 dark:text-zinc-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={resetOptions.preserveSettings}
                  onChange={(e) =>
                    setResetOptions((prev) => ({ ...prev, preserveSettings: e.target.checked }))
                  }
                  className="w-4 h-4 rounded accent-zinc-900 dark:accent-zinc-100"
                />
                <span>Preserve user settings (exam target date, study goals)</span>
              </label>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-200 dark:border-zinc-800">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowResetModal(false)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="danger"
                size="sm"
                onClick={handleConfirmReset}
              >
                Reset Syllabus
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
