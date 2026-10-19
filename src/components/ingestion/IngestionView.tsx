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
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Liquid Glass Command Header */}
      <div className="relative overflow-hidden rounded-3xl p-6 sm:p-8 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-2xl border border-white/20 dark:border-white/10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_12px_40px_rgb(0,0,0,0.4)]">
        <div className="space-y-1.5 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[11px] font-semibold tracking-wide uppercase border border-blue-500/20">
            Data Infrastructure & Portability
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Schedule Ingestion & Data Management Hub
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium max-w-xl">
            Export backup archives, ingest coaching schedules via CSV/JSON, or restore the official
            ICAI 4-paper syllabus blueprint.
          </p>
        </div>
      </div>

      {statusMessage && (
        <div
          className={`p-4 rounded-2xl text-xs flex items-center gap-2.5 backdrop-blur-xl border shadow-sm ${
            statusMessage.type === 'success'
              ? 'bg-emerald-500/[0.08] dark:bg-emerald-500/[0.12] border-emerald-500/30 text-emerald-800 dark:text-emerald-200'
              : 'bg-rose-500/[0.08] dark:bg-rose-500/[0.12] border-rose-500/30 text-rose-800 dark:text-rose-200'
          }`}
        >
          {statusMessage.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
          )}
          <span className="font-semibold">{statusMessage.text}</span>
        </div>
      )}

      {/* Blueprint Statistics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="p-5 rounded-3xl bg-white/60 dark:bg-zinc-900/60 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-[0_8px_30px_rgb(0,0,0,0.03)] space-y-1.5">
          <span className="text-xs text-zinc-400 font-semibold uppercase tracking-wider">Official Papers</span>
          <div className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-100 tabular-nums tracking-tight">4</div>
          <span className="text-[11px] text-zinc-500 dark:text-zinc-400">ACC, BLAW, QA, BECO</span>
        </Card>

        <Card className="p-5 rounded-3xl bg-white/60 dark:bg-zinc-900/60 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-[0_8px_30px_rgb(0,0,0,0.03)] space-y-1.5">
          <span className="text-xs text-zinc-400 font-semibold uppercase tracking-wider">Total Chapters</span>
          <div className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-100 tabular-nums tracking-tight">
            {chapters.length}
          </div>
          <span className="text-[11px] text-zinc-500 dark:text-zinc-400">Across 4 Papers</span>
        </Card>

        <Card className="p-5 rounded-3xl bg-white/60 dark:bg-zinc-900/60 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-[0_8px_30px_rgb(0,0,0,0.03)] space-y-1.5">
          <span className="text-xs text-zinc-400 font-semibold uppercase tracking-wider">Active Topics</span>
          <div className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-100 tabular-nums tracking-tight">
            {topics.length}
          </div>
          <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
            {topics.filter((t) => t.isCustom).length} custom added
          </span>
        </Card>

        <Card className="p-5 rounded-3xl bg-white/60 dark:bg-zinc-900/60 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-[0_8px_30px_rgb(0,0,0,0.03)] space-y-1.5">
          <span className="text-xs text-zinc-400 font-semibold uppercase tracking-wider">Completed Topics</span>
          <div className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 tabular-nums tracking-tight">
            {topics.filter((t) => t.status === 'completed').length}
          </div>
          <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
            {((topics.filter((t) => t.status === 'completed').length / Math.max(1, topics.length)) * 100).toFixed(0)}% completion
          </span>
        </Card>
      </div>

      {/* Export & Reset Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6 sm:p-7 rounded-3xl bg-white/70 dark:bg-zinc-900/70 backdrop-blur-2xl border border-white/20 dark:border-white/10 shadow-[0_8px_30px_rgb(0,0,0,0.03)] space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100">
                Export Backup Archives
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Download your state as JSON or RFC-4180 CSV
              </p>
            </div>
          </div>
          <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
            Export your preparation state, topic progress, test series records, and spaced revision
            plans with full offline portability.
          </p>

          <div className="flex flex-wrap items-center gap-2.5 pt-2">
            <Button
              size="sm"
              variant="secondary"
              leftIcon={<FileCode className="w-4 h-4" />}
              onClick={handleDownloadJSON}
              className="rounded-full swiftui-press"
            >
              Export JSON
            </Button>
            <Button
              size="sm"
              variant="secondary"
              leftIcon={<FileSpreadsheet className="w-4 h-4" />}
              onClick={handleDownloadCSV}
              className="rounded-full swiftui-press"
            >
              Export CSV
            </Button>
            <Button
              size="sm"
              variant="outline"
              leftIcon={<Download className="w-4 h-4" />}
              onClick={handleDownloadTemplate}
              className="rounded-full swiftui-press"
            >
              Sample CSV Template
            </Button>
          </div>
        </Card>

        <Card className="p-6 sm:p-7 rounded-3xl bg-amber-500/[0.04] dark:bg-amber-500/[0.06] backdrop-blur-2xl border border-amber-500/20 shadow-[0_8px_30px_rgba(245,158,11,0.04)] space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <RefreshCw className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100">
                Restore Official Blueprint
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Authoritative ICAI Scheme (May 2026 Onwards)
              </p>
            </div>
          </div>
          <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
            Restore all 4 papers, 46 chapters, and 99 units/chapters to the authoritative ICAI scheme. You can
            selectively preserve custom topics, mock tests, and settings.
          </p>
          <div className="pt-2">
            <Button
              size="sm"
              variant="danger"
              leftIcon={<RefreshCw className="w-4 h-4" />}
              onClick={() => setShowResetModal(true)}
              className="rounded-full swiftui-press"
            >
              Reset to ICAI Blueprint...
            </Button>
          </div>
        </Card>
      </div>

      {/* Ingestion & Import Panel */}
      <Card className="p-6 sm:p-7 rounded-3xl bg-white/70 dark:bg-zinc-900/70 backdrop-blur-2xl border border-white/20 dark:border-white/10 shadow-[0_8px_30px_rgb(0,0,0,0.03)] space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 flex items-center justify-center">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100">
                Schedule & Backup Ingestion Engine
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Upload CSV or JSON files to merge or replace schedules
              </p>
            </div>
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
              className="rounded-full swiftui-press w-full sm:w-auto"
            >
              Upload File (.json / .csv)
            </Button>
          </div>
        </div>

        <form onSubmit={handleProcessImport} className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 bg-black/[0.02] dark:bg-white/[0.03] p-3 rounded-2xl border border-black/5 dark:border-white/5">
            {/* Format Selector */}
            <div className="flex items-center gap-2.5">
              <span className="text-xs text-zinc-400 font-semibold uppercase tracking-wider">Payload Format:</span>
              <div className="flex items-center p-1 rounded-full bg-white dark:bg-zinc-800 border border-black/5 dark:border-white/10 shadow-xs">
                {(['json', 'csv'] as const).map((fmt) => (
                  <button
                    key={fmt}
                    type="button"
                    onClick={() => setImportFormat(fmt)}
                    className={`px-3 py-1 text-xs rounded-full font-semibold transition-all swiftui-press ${
                      importFormat === fmt
                        ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-sm'
                        : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
                    }`}
                  >
                    {fmt.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* Conflict Resolution Mode */}
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-xs text-zinc-400 font-semibold uppercase tracking-wider">Conflict Resolution:</span>
              <div className="flex items-center gap-2">
                {(['merge', 'overwrite', 'skip'] as const).map((mode) => (
                  <label
                    key={mode}
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold cursor-pointer border transition-all ${
                      importMode === mode
                        ? 'bg-white dark:bg-zinc-800 border-black/10 dark:border-white/20 text-zinc-900 dark:text-zinc-100 shadow-xs'
                        : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
                    }`}
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
          </div>

          <textarea
            placeholder={`Paste exported ${importFormat.toUpperCase()} payload here or click "Upload File"...`}
            value={importText}
            onChange={(e) => setImportText(e.target.value)}
            rows={6}
            className="w-full p-4 text-xs font-mono rounded-2xl bg-black/[0.03] dark:bg-white/[0.04] border border-black/5 dark:border-white/10 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
          />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
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
              className="rounded-full swiftui-press w-full sm:w-auto"
            >
              Process Ingestion
            </Button>
          </div>
        </form>
      </Card>

      {/* Reset Confirmation Modal Sheet */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-md flex items-center justify-center p-4">
          <Card className="w-full max-w-md p-6 sm:p-7 space-y-5 rounded-3xl bg-white/95 dark:bg-zinc-900/95 backdrop-blur-2xl border border-white/30 dark:border-white/10 shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <RefreshCw className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                  Confirm ICAI Syllabus Reset
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">Authoritative blueprint restoration</p>
              </div>
            </div>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
              This will restore all 99 units/chapters to their default pending state. Select which items
              you wish to preserve:
            </p>

            <div className="space-y-3 pt-1">
              <label className="flex items-center gap-2.5 text-xs text-zinc-700 dark:text-zinc-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={resetOptions.preserveCustomTopics}
                  onChange={(e) =>
                    setResetOptions((prev) => ({ ...prev, preserveCustomTopics: e.target.checked }))
                  }
                  className="w-4 h-4 rounded-md accent-zinc-900 dark:accent-zinc-100"
                />
                <span>Preserve user-created custom topics</span>
              </label>

              <label className="flex items-center gap-2.5 text-xs text-zinc-700 dark:text-zinc-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={resetOptions.preserveTests}
                  onChange={(e) =>
                    setResetOptions((prev) => ({ ...prev, preserveTests: e.target.checked }))
                  }
                  className="w-4 h-4 rounded-md accent-zinc-900 dark:accent-zinc-100"
                />
                <span>Preserve mock test logs & performance analytics</span>
              </label>

              <label className="flex items-center gap-2.5 text-xs text-zinc-700 dark:text-zinc-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={resetOptions.preserveRevisions}
                  onChange={(e) =>
                    setResetOptions((prev) => ({ ...prev, preserveRevisions: e.target.checked }))
                  }
                  className="w-4 h-4 rounded-md accent-zinc-900 dark:accent-zinc-100"
                />
                <span>Preserve spaced revision cycles & mistake notes</span>
              </label>

              <label className="flex items-center gap-2.5 text-xs text-zinc-700 dark:text-zinc-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={resetOptions.preserveSettings}
                  onChange={(e) =>
                    setResetOptions((prev) => ({ ...prev, preserveSettings: e.target.checked }))
                  }
                  className="w-4 h-4 rounded-md accent-zinc-900 dark:accent-zinc-100"
                />
                <span>Preserve user settings (exam target date, study goals)</span>
              </label>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-black/5 dark:border-white/5">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="rounded-full swiftui-press"
                onClick={() => setShowResetModal(false)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="danger"
                size="sm"
                className="rounded-full swiftui-press"
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
