import React, { useState, useMemo } from 'react';
import {
  Plus,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Search,
  FileSpreadsheet,
} from 'lucide-react';
import { useData } from '@/context/DataContext';
import { Card } from '@/components/common/Card';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import { SubjectId, TestType } from '@/types';
import { formatDate, evaluateMockSeries } from '@/lib/utils';

export const TestsView: React.FC = () => {
  const { tests, subjects, addTest, deleteTest, metrics } = useData();
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const [subjectId, setSubjectId] = useState<SubjectId>('paper1');
  const [testType, setTestType] = useState<TestType>('chapter');
  const [marksObtained, setMarksObtained] = useState('75');
  const [totalMarks, setTotalMarks] = useState('100');
  const [negativeMarks, setNegativeMarks] = useState('0');
  const [dateAttempted, setDateAttempted] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [notes, setNotes] = useState('');
  const [weakTopicsInput, setWeakTopicsInput] = useState('');

  // Filters & sorting
  const [filterSubject, setFilterSubject] = useState<SubjectId | 'all'>('all');
  const [filterType, setFilterType] = useState<TestType | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'score' | 'subject'>('date');

  const handleCreateTest = (e: React.FormEvent) => {
    e.preventDefault();
    const obtained = parseFloat(marksObtained);
    const total = parseFloat(totalMarks);
    const neg = parseFloat(negativeMarks) || 0;
    if (isNaN(obtained) || isNaN(total) || total <= 0 || !title.trim()) return;

    const weakTopicsList = weakTopicsInput
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    addTest({
      title: title.trim(),
      subjectId,
      testType,
      dateAttempted: dateAttempted || new Date().toISOString().split('T')[0],
      marksObtained: Math.max(0, obtained),
      totalMarks: total,
      negativeMarksDeducted: neg > 0 ? neg : undefined,
      notes: notes.trim() || undefined,
      weakTopics: weakTopicsList.length > 0 ? weakTopicsList : undefined,
    });

    setTitle('');
    setMarksObtained('75');
    setTotalMarks('100');
    setNegativeMarks('0');
    setNotes('');
    setWeakTopicsInput('');
    setShowModal(false);
  };

  // Mock series evaluation using official ICAI criteria
  const mockSeriesEval = useMemo(() => {
    return evaluateMockSeries(tests);
  }, [tests]);

  // Filtered and sorted test records
  const filteredTests = useMemo(() => {
    return tests
      .filter((t) => {
        const matchesSub = filterSubject === 'all' || t.subjectId === filterSubject;
        const matchesType = filterType === 'all' || t.testType === filterType;
        const matchesQuery =
          !searchQuery.trim() ||
          t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (t.notes && t.notes.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (t.weakTopics &&
            t.weakTopics.some((w) => w.toLowerCase().includes(searchQuery.toLowerCase())));

        return matchesSub && matchesType && matchesQuery;
      })
      .sort((a, b) => {
        if (sortBy === 'date') {
          return new Date(b.dateAttempted).getTime() - new Date(a.dateAttempted).getTime();
        } else if (sortBy === 'score') {
          return (b.percentage || 0) - (a.percentage || 0);
        } else {
          return a.subjectId.localeCompare(b.subjectId);
        }
      });
  }, [tests, filterSubject, filterType, searchQuery, sortBy]);

  // Chapter Weakness Index (Aggregates weak topics frequency across all tests)
  const weakTopicsIndex = useMemo(() => {
    const counts: Record<string, { count: number; subjectId: SubjectId }> = {};
    tests.forEach((t) => {
      (t.weakTopics || []).forEach((topicStr) => {
        const key = topicStr.trim();
        if (key) {
          if (!counts[key]) {
            counts[key] = { count: 0, subjectId: t.subjectId };
          }
          counts[key].count++;
        }
      });
    });

    return Object.entries(counts)
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);
  }, [tests]);

  // Subject-wise average scores
  const subjectAverages = useMemo(() => {
    const papers: SubjectId[] = ['paper1', 'paper2', 'paper3', 'paper4'];
    return papers.map((pId) => {
      const pTests = tests.filter((t) => t.subjectId === pId && (t.totalMarks || 0) > 0);
      const avg =
        pTests.length > 0
          ? Number(
              (pTests.reduce((acc, t) => acc + (t.percentage || 0), 0) / pTests.length).toFixed(1)
            )
          : 0;
      const sub = subjects.find((s) => s.id === pId);
      return {
        id: pId,
        code: sub?.code || pId,
        shortName: sub?.shortName || pId,
        avg,
        testsCount: pTests.length,
        isPassing: avg >= 40,
      };
    });
  }, [tests, subjects]);

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Liquid Glass Command Header */}
      <div className="relative overflow-hidden rounded-3xl p-6 sm:p-8 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-2xl border border-white/20 dark:border-white/10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_12px_40px_rgb(0,0,0,0.4)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 relative z-10">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[11px] font-semibold tracking-wide uppercase border border-blue-500/20">
              ICAI Examination Standard
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
              Mock Test Series & Performance Analytics
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium max-w-xl">
              ICAI CA Foundation Criteria: Minimum 40% individual paper pass & 50% aggregate (200/400)
            </p>
          </div>

          <Button
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => setShowModal(true)}
            size="sm"
            variant="primary"
            className="rounded-full shadow-md swiftui-press shrink-0"
          >
            Log Test Score
          </Button>
        </div>
      </div>

      {/* ICAI Mock Series Aggregate Qualification Banner */}
      <div
        className={`relative overflow-hidden rounded-3xl p-6 backdrop-blur-2xl border transition-all ${
          mockSeriesEval.overallPassed
            ? 'bg-emerald-500/[0.06] dark:bg-emerald-500/[0.08] border-emerald-500/30 dark:border-emerald-500/20 shadow-[0_8px_30px_rgba(16,185,129,0.08)]'
            : 'bg-amber-500/[0.06] dark:bg-amber-500/[0.08] border-amber-500/30 dark:border-amber-500/20 shadow-[0_8px_30px_rgba(245,158,11,0.08)]'
        }`}
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2.5">
              <Badge
                variant={mockSeriesEval.overallPassed ? 'completed' : 'danger'}
                size="sm"
                className="rounded-full px-3 py-1 font-semibold"
              >
                {mockSeriesEval.statusMessage}
              </Badge>
              <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                Latest 4-Paper Aggregate: {mockSeriesEval.totalMarksObtained} / 400 (
                {mockSeriesEval.aggregatePercentage}%)
              </span>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed max-w-xl">
              {mockSeriesEval.overallPassed
                ? 'Excellent! Your latest mock performances qualify for ICAI CA Foundation.'
                : 'Focus on bringing all individual papers above 40% and total score above 200.'}
            </p>
          </div>

          {/* 4 Papers mini-indicators */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 w-full lg:w-auto">
            {(['paper1', 'paper2', 'paper3', 'paper4'] as SubjectId[]).map((pId) => {
              const score = mockSeriesEval.paperScores[pId];
              const passed = mockSeriesEval.individualPaperPass[pId];
              const sub = subjects.find((s) => s.id === pId);

              return (
                <div
                  key={pId}
                  className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white/80 dark:bg-zinc-800/80 border border-black/5 dark:border-white/10 shadow-sm min-w-[76px]"
                >
                  <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-400 block truncate">
                    {sub?.code || pId}
                  </span>
                  <span
                    className={`text-sm font-bold tabular-nums mt-0.5 ${
                      passed
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-rose-500 dark:text-rose-400'
                    }`}
                  >
                    {score}%
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-5 rounded-3xl bg-white/60 dark:bg-zinc-900/60 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-[0_8px_30px_rgb(0,0,0,0.03)] space-y-1.5">
          <span className="text-xs text-zinc-400 font-semibold uppercase tracking-wider">Tests Attempted</span>
          <div className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-100 tabular-nums tracking-tight">
            {metrics.totalTestsLogged}
          </div>
          <span className="text-xs text-zinc-500 dark:text-zinc-400">
            {tests.filter((t) => t.isPassed).length} passed, {tests.filter((t) => !t.isPassed).length} failed
          </span>
        </Card>

        <Card className="p-5 rounded-3xl bg-white/60 dark:bg-zinc-900/60 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-[0_8px_30px_rgb(0,0,0,0.03)] space-y-1.5">
          <span className="text-xs text-zinc-400 font-semibold uppercase tracking-wider">Overall Average Score</span>
          <div className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-100 tabular-nums tracking-tight">
            {metrics.recentTestsAveragePercentage}%
          </div>
          <span className="text-xs text-zinc-500 dark:text-zinc-400">
            Target: &gt;= 50% for aggregate qualification
          </span>
        </Card>

        <Card className="p-5 rounded-3xl bg-white/60 dark:bg-zinc-900/60 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-[0_8px_30px_rgb(0,0,0,0.03)] space-y-1.5">
          <span className="text-xs text-zinc-400 font-semibold uppercase tracking-wider">Subject Breakdown</span>
          <div className="grid grid-cols-4 gap-1.5 mt-2 text-center">
            {subjectAverages.map((sub) => (
              <div key={sub.id} className="p-1.5 rounded-xl bg-black/[0.02] dark:bg-white/[0.04] text-xs">
                <span className="text-[10px] font-bold text-zinc-400 block">{sub.code}</span>
                <span
                  className={`font-semibold tabular-nums ${
                    sub.isPassing ? 'text-zinc-900 dark:text-zinc-100' : 'text-rose-500'
                  }`}
                >
                  {sub.avg}%
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Chapter Weakness Index Section */}
      {weakTopicsIndex.length > 0 && (
        <Card className="p-5 rounded-3xl bg-amber-500/[0.04] dark:bg-amber-500/[0.06] backdrop-blur-xl border border-amber-500/20 space-y-3 shadow-sm">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              Chapter Weakness Index (High Priority Revision Queue)
            </h3>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Topics frequently tagged as weak during mock tests. Prioritize these in your Revision
            Planner.
          </p>

          <div className="flex flex-wrap gap-2 pt-1">
            {weakTopicsIndex.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white dark:bg-zinc-800/90 border border-amber-500/30 text-amber-900 dark:text-amber-200 text-xs shadow-xs"
              >
                <Badge variant={item.subjectId} size="sm" className="rounded-full">
                  {item.subjectId.toUpperCase()}
                </Badge>
                <span className="font-medium">{item.name}</span>
                <span className="font-bold tabular-nums">({item.count}x flagged)</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Filter and Search Bar for Test History */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-2 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/5 dark:border-white/5">
        <div className="flex flex-wrap items-center gap-2">
          {/* Subject Filter */}
          <select
            value={filterSubject}
            onChange={(e) => setFilterSubject(e.target.value as SubjectId | 'all')}
            className="px-3 py-2 text-xs font-medium rounded-xl bg-white dark:bg-zinc-800 border border-black/5 dark:border-white/10 text-zinc-900 dark:text-zinc-100 shadow-xs focus:outline-none cursor-pointer"
          >
            <option value="all">All Subjects (4)</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.code} - {s.shortName}
              </option>
            ))}
          </select>

          {/* Test Type Filter */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as TestType | 'all')}
            className="px-3 py-2 text-xs font-medium rounded-xl bg-white dark:bg-zinc-800 border border-black/5 dark:border-white/10 text-zinc-900 dark:text-zinc-100 shadow-xs focus:outline-none cursor-pointer"
          >
            <option value="all">All Types</option>
            <option value="chapter">Chapter Tests</option>
            <option value="unit">Unit Tests</option>
            <option value="mock">Full Mock Exams</option>
          </select>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-2 text-xs font-medium rounded-xl bg-white dark:bg-zinc-800 border border-black/5 dark:border-white/10 text-zinc-900 dark:text-zinc-100 shadow-xs focus:outline-none cursor-pointer"
          >
            <option value="date">Sort by Date</option>
            <option value="score">Sort by Score</option>
            <option value="subject">Sort by Subject</option>
          </select>
        </div>

        {/* Search */}
        <div className="relative flex-1 sm:w-60">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            type="text"
            placeholder="Search tests..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-white dark:bg-zinc-800 border border-black/5 dark:border-white/10 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400 shadow-xs"
          />
        </div>
      </div>

      {/* Test Log List */}
      {tests.length === 0 ? (
        <Card className="text-center py-16 px-6 space-y-4 rounded-3xl bg-white/40 dark:bg-zinc-900/40 backdrop-blur-xl border border-white/20 dark:border-white/10">
          <div className="w-14 h-14 rounded-2xl bg-zinc-100 dark:bg-zinc-800/80 text-zinc-400 flex items-center justify-center mx-auto shadow-inner">
            <FileSpreadsheet className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 text-base">
              No mock tests recorded yet
            </h3>
            <p className="text-xs text-zinc-500 max-w-sm mx-auto leading-relaxed">
              Log your chapter tests, unit revisions, or full 100-mark mock exams to assess passing
              probabilities and analyze weakness patterns.
            </p>
          </div>
          <Button size="sm" variant="primary" className="rounded-full swiftui-press" onClick={() => setShowModal(true)}>
            Log First Test
          </Button>
        </Card>
      ) : filteredTests.length === 0 ? (
        <Card className="text-center py-12 rounded-3xl bg-white/40 dark:bg-zinc-900/40 backdrop-blur-xl border border-white/20 dark:border-white/10">
          <p className="text-xs text-zinc-500">No tests match your filter criteria.</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredTests.map((test) => (
            <Card
              key={test.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-5 gap-4 rounded-2xl bg-white/60 dark:bg-zinc-900/60 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-[0_4px_20px_rgb(0,0,0,0.02)] hover:border-zinc-300 dark:hover:border-zinc-700 transition-all duration-300"
            >
              <div className="space-y-1.5 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant={test.subjectId} size="sm" className="rounded-full font-semibold">
                    {test.subjectId.toUpperCase()}
                  </Badge>
                  <span className="text-[10px] uppercase tracking-wider text-zinc-400 font-bold px-2 py-0.5 rounded-full bg-black/[0.04] dark:bg-white/[0.06]">
                    {test.testType}
                  </span>
                  <h4 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">
                    {test.title}
                  </h4>
                </div>

                <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                  <span>Attempted {formatDate(test.dateAttempted)}</span>
                  {test.negativeMarksDeducted && test.negativeMarksDeducted > 0 && (
                    <span>• -{test.negativeMarksDeducted} neg marks</span>
                  )}
                  {test.notes && <span>• {test.notes}</span>}
                </div>

                {test.weakTopics && test.weakTopics.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {test.weakTopics.map((w, i) => (
                      <span
                        key={i}
                        className="text-[10px] px-2.5 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700"
                      >
                        Weak: {w}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-5 border-t sm:border-t-0 border-black/5 dark:border-white/5 pt-3 sm:pt-0 shrink-0">
                <div className="text-right">
                  <div className="flex items-center gap-1.5 justify-end">
                    {test.isPassed ? (
                      <CheckCircle className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <XCircle className="w-4 h-4 text-rose-500" />
                    )}
                    <span className="font-bold text-sm text-zinc-900 dark:text-zinc-100 tabular-nums">
                      {test.marksObtained} / {test.totalMarks}
                    </span>
                  </div>
                  <span className="text-xs text-zinc-500 dark:text-zinc-400 tabular-nums">
                    {test.percentage}% ({test.isPassed ? 'Passed' : 'Failed (<40%)'})
                  </span>
                </div>

                <Button
                  size="sm"
                  variant="ghost"
                  className="text-rose-500 hover:text-rose-700 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-xs px-3 py-1.5 rounded-full swiftui-press"
                  onClick={() => deleteTest(test.id)}
                >
                  Delete
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Log Test Modal Sheet */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-md flex items-center justify-center p-4">
          <Card className="w-full max-w-lg p-6 sm:p-7 space-y-5 rounded-3xl bg-white/95 dark:bg-zinc-900/95 backdrop-blur-2xl border border-white/30 dark:border-white/10 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                Log Test Score & Analysis
              </h3>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-black/5 dark:hover:bg-white/5 swiftui-press"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateTest} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                  Test Title *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Chapter 1-3 Diagnostic Test / ICAI BOS Mock 1"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-2xl bg-zinc-100/80 dark:bg-zinc-800/80 border border-black/5 dark:border-white/10 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                  required
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                    Subject Paper
                  </label>
                  <select
                    value={subjectId}
                    onChange={(e) => setSubjectId(e.target.value as SubjectId)}
                    className="w-full px-3.5 py-2.5 text-xs rounded-2xl bg-zinc-100/80 dark:bg-zinc-800/80 border border-black/5 dark:border-white/10 text-zinc-900 dark:text-zinc-100 focus:outline-none"
                  >
                    {subjects.map((sub) => (
                      <option key={sub.id} value={sub.id}>
                        {sub.code} - {sub.shortName}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                    Test Type
                  </label>
                  <select
                    value={testType}
                    onChange={(e) => setTestType(e.target.value as TestType)}
                    className="w-full px-3.5 py-2.5 text-xs rounded-2xl bg-zinc-100/80 dark:bg-zinc-800/80 border border-black/5 dark:border-white/10 text-zinc-900 dark:text-zinc-100 focus:outline-none"
                  >
                    <option value="chapter">Chapter Test</option>
                    <option value="unit">Unit Test</option>
                    <option value="mock">Full Mock Exam</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                    Marks Obtained *
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={marksObtained}
                    onChange={(e) => setMarksObtained(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs rounded-2xl bg-zinc-100/80 dark:bg-zinc-800/80 border border-black/5 dark:border-white/10 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                    Total Marks *
                  </label>
                  <input
                    type="number"
                    value={totalMarks}
                    onChange={(e) => setTotalMarks(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs rounded-2xl bg-zinc-100/80 dark:bg-zinc-800/80 border border-black/5 dark:border-white/10 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                    Negative Marks Deducted
                  </label>
                  <input
                    type="number"
                    step="0.25"
                    value={negativeMarks}
                    onChange={(e) => setNegativeMarks(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs rounded-2xl bg-zinc-100/80 dark:bg-zinc-800/80 border border-black/5 dark:border-white/10 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                    Date Attempted
                  </label>
                  <input
                    type="date"
                    value={dateAttempted}
                    onChange={(e) => setDateAttempted(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs rounded-2xl bg-zinc-100/80 dark:bg-zinc-800/80 border border-black/5 dark:border-white/10 text-zinc-900 dark:text-zinc-100 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                  Weak Topics (comma separated)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Consideration, Partnership Goodwill, Ratio Analysis"
                  value={weakTopicsInput}
                  onChange={(e) => setWeakTopicsInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-2xl bg-zinc-100/80 dark:bg-zinc-800/80 border border-black/5 dark:border-white/10 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                  Notes & Key Observations
                </label>
                <textarea
                  placeholder="e.g. Ran out of time on Section B; revise journal entries"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  className="w-full px-3.5 py-2.5 text-xs rounded-2xl bg-zinc-100/80 dark:bg-zinc-800/80 border border-black/5 dark:border-white/10 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="rounded-full swiftui-press"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm" className="rounded-full swiftui-press">
                  Save Test Score
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
};
