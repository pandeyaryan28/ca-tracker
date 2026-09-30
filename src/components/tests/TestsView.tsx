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
    <div className="space-y-6 animate-fade-in">
      {/* Header Summary & Log Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
            Mock Test Series & Performance Analytics
          </h2>
          <p className="text-xs text-zinc-500">
            ICAI CA Foundation Criteria: Minimum 40% individual paper pass & 50% aggregate (200/400)
          </p>
        </div>

        <Button
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={() => setShowModal(true)}
          size="sm"
          variant="primary"
        >
          Log Test Score
        </Button>
      </div>

      {/* ICAI Mock Series Aggregate Qualification Banner */}
      <Card
        className={`p-5 border-l-4 ${
          mockSeriesEval.overallPassed
            ? 'border-l-emerald-500 bg-emerald-50/30 dark:bg-emerald-950/20'
            : 'border-l-amber-500 bg-amber-50/30 dark:bg-amber-950/20'
        }`}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge
                variant={mockSeriesEval.overallPassed ? 'completed' : 'danger'}
                size="sm"
              >
                {mockSeriesEval.statusMessage}
              </Badge>
              <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Latest 4-Paper Aggregate: {mockSeriesEval.totalMarksObtained} / 400 (
                {mockSeriesEval.aggregatePercentage}%)
              </span>
            </div>
            <p className="text-xs text-zinc-500">
              {mockSeriesEval.overallPassed
                ? 'Excellent! Your latest mock performances qualify for ICAI CA Foundation.'
                : 'Focus on bringing all individual papers above 40% and total score above 200.'}
            </p>
          </div>

          {/* 4 Papers mini-indicators */}
          <div className="grid grid-cols-4 gap-2 w-full md:w-auto">
            {(['paper1', 'paper2', 'paper3', 'paper4'] as SubjectId[]).map((pId) => {
              const score = mockSeriesEval.paperScores[pId];
              const passed = mockSeriesEval.individualPaperPass[pId];
              const sub = subjects.find((s) => s.id === pId);

              return (
                <div
                  key={pId}
                  className="text-center p-2 rounded-xl bg-white dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 min-w-0"
                >
                  <span className="text-[10px] uppercase font-bold text-zinc-400 block truncate">
                    {sub?.code || pId}
                  </span>
                  <span
                    className={`text-xs font-bold tabular-nums ${
                      passed
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-red-500 dark:text-red-400'
                    }`}
                  >
                    {score}%
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </Card>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="space-y-1">
          <span className="text-xs text-zinc-500 font-medium">Tests Attempted</span>
          <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 tabular-nums">
            {metrics.totalTestsLogged}
          </div>
          <span className="text-[11px] text-zinc-400">
            {tests.filter((t) => t.isPassed).length} passed, {tests.filter((t) => !t.isPassed).length} failed
          </span>
        </Card>

        <Card className="space-y-1">
          <span className="text-xs text-zinc-500 font-medium">Overall Average Score</span>
          <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 tabular-nums">
            {metrics.recentTestsAveragePercentage}%
          </div>
          <span className="text-[11px] text-zinc-400">
            Target: &gt;= 50% for aggregate qualification
          </span>
        </Card>

        <Card className="space-y-1">
          <span className="text-xs text-zinc-500 font-medium">Subject Breakdown</span>
          <div className="grid grid-cols-4 gap-1 mt-1 text-center">
            {subjectAverages.map((sub) => (
              <div key={sub.id} className="text-xs">
                <span className="text-[10px] text-zinc-400 block">{sub.code}</span>
                <span
                  className={`font-semibold tabular-nums ${
                    sub.isPassing ? 'text-zinc-900 dark:text-zinc-100' : 'text-red-500'
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
        <Card className="p-4 space-y-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              Chapter Weakness Index (High Priority Revision Queue)
            </h3>
          </div>
          <p className="text-xs text-zinc-500">
            Topics frequently tagged as weak during mock tests. Prioritize these in your Revision
            Planner.
          </p>

          <div className="flex flex-wrap gap-2 pt-1">
            {weakTopicsIndex.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-amber-900 dark:text-amber-200 text-xs"
              >
                <Badge variant={item.subjectId} size="sm">
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {/* Subject Filter */}
          <select
            value={filterSubject}
            onChange={(e) => setFilterSubject(e.target.value as SubjectId | 'all')}
            className="p-2 text-xs rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100"
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
            className="p-2 text-xs rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100"
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
            className="p-2 text-xs rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100"
          >
            <option value="date">Sort by Date</option>
            <option value="score">Sort by Score</option>
            <option value="subject">Sort by Subject</option>
          </select>
        </div>

        {/* Search */}
        <div className="relative flex-1 sm:w-56">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            type="text"
            placeholder="Search tests..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-500"
          />
        </div>
      </div>

      {/* Test Log List */}
      {tests.length === 0 ? (
        <Card className="text-center py-12 space-y-3">
          <div className="w-12 h-12 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-400 flex items-center justify-center mx-auto">
            <FileSpreadsheet className="w-6 h-6" />
          </div>
          <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 text-sm">
            No mock tests recorded yet
          </h3>
          <p className="text-xs text-zinc-500 max-w-sm mx-auto">
            Log your chapter tests, unit revisions, or full 100-mark mock exams to assess passing
            probabilities and analyze weakness patterns.
          </p>
          <Button size="sm" variant="primary" onClick={() => setShowModal(true)}>
            Log First Test
          </Button>
        </Card>
      ) : filteredTests.length === 0 ? (
        <Card className="text-center py-8">
          <p className="text-xs text-zinc-500">No tests match your filter criteria.</p>
        </Card>
      ) : (
        <div className="space-y-2.5">
          {filteredTests.map((test) => (
            <Card
              key={test.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between p-4 gap-3 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors"
            >
              <div className="space-y-1.5 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant={test.subjectId} size="sm">
                    {test.subjectId.toUpperCase()}
                  </Badge>
                  <span className="text-xs uppercase tracking-wider text-zinc-400 font-semibold">
                    {test.testType}
                  </span>
                  <h4 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">
                    {test.title}
                  </h4>
                </div>

                <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-500">
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
                        className="text-[10px] px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700"
                      >
                        Weak: {w}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 pt-2 sm:pt-0 shrink-0">
                <div className="text-right">
                  <div className="flex items-center gap-1.5 justify-end">
                    {test.isPassed ? (
                      <CheckCircle className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-500" />
                    )}
                    <span className="font-bold text-sm text-zinc-900 dark:text-zinc-100 tabular-nums">
                      {test.marksObtained} / {test.totalMarks}
                    </span>
                  </div>
                  <span className="text-xs text-zinc-500 tabular-nums">
                    {test.percentage}% ({test.isPassed ? 'Passed' : 'Failed (<40%)'})
                  </span>
                </div>

                <Button
                  size="sm"
                  variant="ghost"
                  className="text-red-500 hover:text-red-700 text-xs px-2 touch-target min-h-[38px]"
                  onClick={() => deleteTest(test.id)}
                >
                  Delete
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Log Test Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <Card className="w-full max-w-md p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
              Log Test Score & Analysis
            </h3>
            <form onSubmit={handleCreateTest} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Test Title *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Chapter 1-3 Diagnostic Test / ICAI BOS Mock 1"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full p-2.5 text-xs rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100"
                  required
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    Subject Paper
                  </label>
                  <select
                    value={subjectId}
                    onChange={(e) => setSubjectId(e.target.value as SubjectId)}
                    className="w-full p-2 text-xs rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100"
                  >
                    {subjects.map((sub) => (
                      <option key={sub.id} value={sub.id}>
                        {sub.code} - {sub.shortName}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    Test Type
                  </label>
                  <select
                    value={testType}
                    onChange={(e) => setTestType(e.target.value as TestType)}
                    className="w-full p-2 text-xs rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100"
                  >
                    <option value="chapter">Chapter Test</option>
                    <option value="unit">Unit Test</option>
                    <option value="mock">Full Mock Exam</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    Marks Obtained *
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={marksObtained}
                    onChange={(e) => setMarksObtained(e.target.value)}
                    className="w-full p-2.5 text-xs rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    Total Marks *
                  </label>
                  <input
                    type="number"
                    value={totalMarks}
                    onChange={(e) => setTotalMarks(e.target.value)}
                    className="w-full p-2.5 text-xs rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    Negative Marks Deducted
                  </label>
                  <input
                    type="number"
                    step="0.25"
                    value={negativeMarks}
                    onChange={(e) => setNegativeMarks(e.target.value)}
                    className="w-full p-2.5 text-xs rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    Date Attempted
                  </label>
                  <input
                    type="date"
                    value={dateAttempted}
                    onChange={(e) => setDateAttempted(e.target.value)}
                    className="w-full p-2 text-xs rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Weak Topics (comma separated)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Consideration, Partnership Goodwill, Ratio Analysis"
                  value={weakTopicsInput}
                  onChange={(e) => setWeakTopicsInput(e.target.value)}
                  className="w-full p-2.5 text-xs rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Notes & Key Observations
                </label>
                <textarea
                  placeholder="e.g. Ran out of time on Section B; revise journal entries"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  className="w-full p-2.5 text-xs rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm">
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
