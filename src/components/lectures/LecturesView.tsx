import React, { useState, useMemo } from 'react';
import {
  Play,
  CheckCircle2,
  Circle,
  ExternalLink,
  Search,
  Cloud,
  Check,
  Film,
  Calendar,
  Layers,
  TrendingUp,
  Clock,
  BookOpen,
} from 'lucide-react';
import { useData } from '@/context/DataContext';
import { Card } from '@/components/common/Card';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import { ProgressBar } from '@/components/common/ProgressBar';
import { Lecture } from '@/types';
import { normalizeSubjectId } from '@/lib/seedLoader';
import { cn } from '@/lib/utils';

export type LectureFilter = 'all' | 'unwatched' | 'watched';
export type SubjectFilter = 'all' | 'paper1' | 'paper2' | 'paper4';

export const LecturesView: React.FC = () => {
  const { lectures, toggleLectureWatched, isCloudConnected, lastSyncedAt } = useData();
  const [selectedSubject, setSelectedSubject] = useState<SubjectFilter>('all');
  const [filter, setFilter] = useState<LectureFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activePreviewLecture, setActivePreviewLecture] = useState<Lecture | null>(null);

  // All lectures sorted by subject then by sequence order
  const sortedLectures = useMemo(() => {
    return [...(lectures || [])].sort((a, b) => {
      const subA = normalizeSubjectId(a.subjectId);
      const subB = normalizeSubjectId(b.subjectId);
      if (subA !== subB) return subA.localeCompare(subB);
      return (a.order || 0) - (b.order || 0);
    });
  }, [lectures]);

  const paper1Lectures = useMemo(
    () => sortedLectures.filter((l) => normalizeSubjectId(l.subjectId) === 'paper1'),
    [sortedLectures]
  );
  const paper2Lectures = useMemo(
    () => sortedLectures.filter((l) => normalizeSubjectId(l.subjectId) === 'paper2'),
    [sortedLectures]
  );
  const paper4Lectures = useMemo(
    () => sortedLectures.filter((l) => normalizeSubjectId(l.subjectId) === 'paper4'),
    [sortedLectures]
  );

  const subjectLectures = useMemo(() => {
    if (selectedSubject === 'paper1') return paper1Lectures;
    if (selectedSubject === 'paper2') return paper2Lectures;
    if (selectedSubject === 'paper4') return paper4Lectures;
    return sortedLectures;
  }, [selectedSubject, paper1Lectures, paper2Lectures, paper4Lectures, sortedLectures]);

  const totalCount = subjectLectures.length;
  const watchedCount = subjectLectures.filter((l) => l.watched).length;
  const remainingCount = totalCount - watchedCount;
  const watchPercentage = totalCount > 0 ? Math.round((watchedCount / totalCount) * 100) : 0;

  const filteredLectures = useMemo(() => {
    return subjectLectures.filter((lec) => {
      // Status filter
      if (filter === 'watched' && !lec.watched) return false;
      if (filter === 'unwatched' && lec.watched) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = (lec.title || '').toLowerCase().includes(q);
        const matchMapping = (lec.curriculumMapping || '').toLowerCase().includes(q);
        return matchTitle || matchMapping;
      }

      return true;
    });
  }, [subjectLectures, filter, searchQuery]);

  const formatUploadDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return (isoString || '').split('T')[0];
    }
  };

  const headerInfo = useMemo(() => {
    if (selectedSubject === 'paper1') {
      return {
        badgeText: 'Paper 1: Accounting',
        badgeVariant: 'paper1' as const,
        title: 'Accounts Lectures',
        subtitle:
          'Curated One-Shot accountancy video series in chronological upload sequence, mapped to ICAI syllabus units.',
        totalSubtitle: '19 Lectures',
        progressSubject: 'paper1' as const,
      };
    }
    if (selectedSubject === 'paper2') {
      return {
        badgeText: 'Paper 2: Business Laws',
        badgeVariant: 'paper2' as const,
        title: 'Business Laws Lectures',
        subtitle:
          'PW Chanakya 3.0 One-Shot Business Laws series by CA Nikesh Agrawal, covering all 7 ICAI syllabus chapters.',
        totalSubtitle: '7 Chapters Covered',
        progressSubject: 'paper2' as const,
      };
    }
    if (selectedSubject === 'paper4') {
      return {
        badgeText: 'Paper 4: Business Economics',
        badgeVariant: 'paper4' as const,
        title: 'Business Economics Lectures',
        subtitle:
          'PW Chanakya 3.0 One-Shot Business Economics series by Love Kaushik Sir, covering all 9 ICAI syllabus chapters.',
        totalSubtitle: '7 Marathon Lectures',
        progressSubject: 'paper4' as const,
      };
    }
    return {
      badgeText: `All Subjects (${sortedLectures.length} Videos)`,
      badgeVariant: 'default' as const,
      title: 'Video Lectures & Watch History',
      subtitle:
        'Curated One-Shot video series for Accounting, Business Laws & Business Economics mapped directly to official ICAI syllabus chapters.',
      totalSubtitle: `${sortedLectures.length} Total Lectures`,
      progressSubject: 'paper1' as const,
    };
  }, [selectedSubject, sortedLectures.length]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Top Header & Cloud Status — Apple Liquid Glass Command Card */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5 p-6 sm:p-7 rounded-3xl border border-white/20 dark:border-white/10 bg-white/80 dark:bg-zinc-900/70 backdrop-blur-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_12px_40px_rgb(0,0,0,0.45)]">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant={headerInfo.badgeVariant} size="sm">
              {headerInfo.badgeText}
            </Badge>
            <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 dark:bg-emerald-500/15 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 dark:bg-emerald-400" />
              Cloud Synced (Firestore)
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 flex items-center gap-2.5">
            <Film className="w-7 h-7 text-red-600 dark:text-red-500" />
            {headerInfo.title}
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1.5 max-w-2xl leading-relaxed">
            {headerInfo.subtitle}
          </p>
        </div>

        {/* Sync Info */}
        <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400 bg-zinc-100/70 dark:bg-zinc-800/70 px-3.5 py-1.5 rounded-full border border-zinc-200/50 dark:border-zinc-700/50 self-start sm:self-center">
          <Cloud className="w-4 h-4 text-blue-500" />
          <span>
            {isCloudConnected ? 'Connected to Cloud Firestore' : 'Reconnecting...'}
          </span>
          {lastSyncedAt && (
            <span className="hidden sm:inline opacity-70">
              • {new Date(lastSyncedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
        </div>
      </div>

      {/* Subject Filter Tabs — Apple Segmented Control */}
      <div className="inline-flex items-center gap-1.5 p-1.5 rounded-full bg-zinc-200/50 dark:bg-zinc-800/50 backdrop-blur-md border border-zinc-300/40 dark:border-zinc-700/40 overflow-x-auto max-w-full">
        <button
          type="button"
          onClick={() => setSelectedSubject('all')}
          className={cn(
            'px-3.5 py-1.5 text-xs font-semibold rounded-full transition-all flex items-center gap-2 whitespace-nowrap shrink-0 swiftui-press active:scale-[0.98]',
            selectedSubject === 'all'
              ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-sm border border-zinc-200/60 dark:border-zinc-700/60'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
          )}
        >
          <Film className="w-3.5 h-3.5" />
          <span>All Papers</span>
          <span
            className={cn(
              'px-1.5 py-0.2 rounded-full text-[10px] font-bold',
              selectedSubject === 'all'
                ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300'
            )}
          >
            {sortedLectures.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setSelectedSubject('paper1')}
          className={cn(
            'px-3.5 py-1.5 text-xs font-semibold rounded-full transition-all flex items-center gap-2 whitespace-nowrap shrink-0 swiftui-press active:scale-[0.98]',
            selectedSubject === 'paper1'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/10'
          )}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Paper 1: Accounting</span>
          <span
            className={cn(
              'px-1.5 py-0.2 rounded-full text-[10px] font-bold',
              selectedSubject === 'paper1'
                ? 'bg-emerald-700 text-white'
                : 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300'
            )}
          >
            {paper1Lectures.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setSelectedSubject('paper2')}
          className={cn(
            'px-3.5 py-1.5 text-xs font-semibold rounded-full transition-all flex items-center gap-2 whitespace-nowrap shrink-0 swiftui-press active:scale-[0.98]',
            selectedSubject === 'paper2'
              ? 'bg-violet-600 text-white shadow-sm'
              : 'text-violet-700 dark:text-violet-400 hover:bg-violet-500/10'
          )}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Paper 2: Business Laws</span>
          <span
            className={cn(
              'px-1.5 py-0.2 rounded-full text-[10px] font-bold',
              selectedSubject === 'paper2'
                ? 'bg-violet-700 text-white'
                : 'bg-violet-100 dark:bg-violet-900/60 text-violet-800 dark:text-violet-300'
            )}
          >
            {paper2Lectures.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setSelectedSubject('paper4')}
          className={cn(
            'px-3.5 py-1.5 text-xs font-semibold rounded-full transition-all flex items-center gap-2 whitespace-nowrap shrink-0 swiftui-press active:scale-[0.98]',
            selectedSubject === 'paper4'
              ? 'bg-amber-600 text-white shadow-sm'
              : 'text-amber-700 dark:text-amber-400 hover:bg-amber-500/10'
          )}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Paper 4: Economics</span>
          <span
            className={cn(
              'px-1.5 py-0.2 rounded-full text-[10px] font-bold',
              selectedSubject === 'paper4'
                ? 'bg-amber-700 text-white'
                : 'bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300'
            )}
          >
            {paper4Lectures.length}
          </span>
        </button>
      </div>

      {/* Progress Cards — Apple Squircle Glass Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-5 rounded-2xl border border-zinc-200/60 dark:border-zinc-800/60 bg-white/70 dark:bg-zinc-900/60 backdrop-blur-xl shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Total Lectures</span>
            <Film className="w-4 h-4 text-zinc-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">{totalCount}</span>
            <span className="text-xs text-zinc-400 font-medium">{headerInfo.totalSubtitle}</span>
          </div>
          <div className="mt-3">
            <ProgressBar value={100} size="sm" />
          </div>
        </Card>

        <Card className="p-5 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 dark:bg-emerald-500/10 backdrop-blur-xl shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider">Watched</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400">{watchedCount}</span>
            <span className="text-xs text-zinc-400 font-medium">/ {totalCount} completed</span>
          </div>
          <div className="mt-3">
            <ProgressBar value={watchPercentage} colorHex="#10B981" size="sm" />
          </div>
        </Card>

        <Card className="p-5 rounded-2xl border border-amber-500/20 bg-amber-500/5 dark:bg-amber-500/10 backdrop-blur-xl shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-700 dark:text-amber-300 uppercase tracking-wider">Watch Completion</span>
            <TrendingUp className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">{watchPercentage}%</span>
            <span className="text-xs text-zinc-400 font-medium">{remainingCount} left to watch</span>
          </div>
          <div className="mt-3">
            <ProgressBar value={watchPercentage} subjectId={headerInfo.progressSubject} size="sm" />
          </div>
        </Card>
      </div>

      {/* Search & Filter Controls — Apple Liquid Glass Toolbar */}
      <Card className="p-4 rounded-2xl border border-white/20 dark:border-white/10 bg-white/80 dark:bg-zinc-900/70 backdrop-blur-xl shadow-sm">
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          {/* Filter Pills */}
          <div className="inline-flex items-center gap-1 p-1 rounded-full bg-zinc-200/50 dark:bg-zinc-800/50 backdrop-blur-md border border-zinc-300/40 dark:border-zinc-700/40">
            <button
              type="button"
              onClick={() => setFilter('all')}
              className={cn(
                'px-3.5 py-1.5 text-xs font-semibold rounded-full transition-all swiftui-press active:scale-[0.98]',
                filter === 'all'
                  ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-sm border border-zinc-200/60 dark:border-zinc-700/60'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
              )}
            >
              All ({totalCount})
            </button>
            <button
              type="button"
              onClick={() => setFilter('unwatched')}
              className={cn(
                'px-3.5 py-1.5 text-xs font-semibold rounded-full transition-all swiftui-press active:scale-[0.98]',
                filter === 'unwatched'
                  ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-sm border border-zinc-200/60 dark:border-zinc-700/60'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
              )}
            >
              Unwatched ({remainingCount})
            </button>
            <button
              type="button"
              onClick={() => setFilter('watched')}
              className={cn(
                'px-3.5 py-1.5 text-xs font-semibold rounded-full transition-all swiftui-press active:scale-[0.98]',
                filter === 'watched'
                  ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-sm border border-zinc-200/60 dark:border-zinc-700/60'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
              )}
            >
              Watched ({watchedCount})
            </button>
          </div>

          {/* Search Box */}
          <div className="relative flex-1 sm:max-w-xs">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search lectures or chapters..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 text-xs rounded-full bg-white/70 dark:bg-zinc-800/70 border border-zinc-200/70 dark:border-zinc-700/70 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400"
            />
          </div>
        </div>
      </Card>

      {/* Embedded Video Player Modal (Optional In-App Viewer) */}
      {activePreviewLecture && (
        <Card className="p-5 rounded-3xl border border-red-500/30 bg-zinc-900 text-zinc-100 overflow-hidden shadow-2xl">
          <div className="flex items-center justify-between pb-3.5 border-b border-zinc-800 mb-3.5">
            <div className="flex items-center gap-2">
              <Play className="w-4 h-4 text-red-500 fill-current" />
              <span className="text-xs font-semibold text-zinc-200 truncate max-w-xl">
                Watching: {activePreviewLecture.title}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setActivePreviewLecture(null)}
              className="text-xs text-zinc-400 hover:text-zinc-100 px-3 py-1 rounded-full bg-zinc-800 transition-colors swiftui-press"
            >
              Close Player
            </button>
          </div>
          <div className="aspect-video w-full rounded-2xl overflow-hidden bg-black">
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${activePreviewLecture.youtubeId}?autoplay=1`}
              title={activePreviewLecture.title}
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </Card>
      )}

      {/* Lectures List */}
      <div className="space-y-3.5">
        {filteredLectures.length === 0 ? (
          <Card className="p-12 text-center rounded-3xl border border-white/20 dark:border-white/10 bg-white/80 dark:bg-zinc-900/70 backdrop-blur-2xl shadow-sm">
            <Film className="w-10 h-10 text-zinc-300 dark:text-zinc-600 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-zinc-800 dark:text-zinc-200">No lectures found</h3>
            <p className="text-xs text-zinc-400 mt-1">Try adjusting your filter or search query.</p>
          </Card>
        ) : (
          filteredLectures.map((lec) => {
            const isLaw = normalizeSubjectId(lec.subjectId) === 'paper2';
            const isEco = normalizeSubjectId(lec.subjectId) === 'paper4';

            return (
              <Card
                key={lec.id}
                className={cn(
                  'p-5 rounded-2xl transition-all duration-200 hover:shadow-md border border-white/20 dark:border-white/10 bg-white/80 dark:bg-zinc-900/70 backdrop-blur-xl',
                  lec.watched && 'bg-emerald-500/[0.04] dark:bg-emerald-500/[0.08] border-emerald-500/30'
                )}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  {/* Left: Sequence & Details */}
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    {/* Sequence Badge */}
                    <div
                      className={cn(
                        'w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 shadow-xs',
                        lec.watched
                          ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300'
                          : isLaw
                          ? 'bg-violet-500/20 text-violet-700 dark:text-violet-300'
                          : isEco
                          ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300'
                          : 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300'
                      )}
                    >
                      #{lec.order}
                    </div>

                    {/* Title & Metas */}
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        {/* Paper Indicator (when in All view) */}
                        {selectedSubject === 'all' && (
                          <Badge
                            variant={isLaw ? 'paper2' : isEco ? 'paper4' : 'paper1'}
                            size="sm"
                          >
                            {isLaw ? 'Paper 2: Law' : isEco ? 'Paper 4: Eco' : 'Paper 1: Accounts'}
                          </Badge>
                        )}

                        {/* Upload Date */}
                        <span className="text-xs text-zinc-400 font-medium inline-flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          Uploaded {formatUploadDate(lec.uploadDate)}
                        </span>

                        {/* Duration chip if available */}
                        {lec.duration && (
                          <span className="text-xs text-zinc-400 font-medium inline-flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            {lec.duration}
                          </span>
                        )}

                        {lec.watched && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-500/15 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                            <Check className="w-3 h-3" />
                            Watched
                          </span>
                        )}
                      </div>

                      <h3 className="text-sm sm:text-base font-semibold text-zinc-900 dark:text-zinc-100 leading-snug">
                        {lec.title}
                      </h3>

                      {/* Mapped Curriculum Chapter & Unit */}
                      <div className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
                        <Layers className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                        <span className="font-medium truncate" title={lec.curriculumMapping}>
                          {lec.curriculumMapping}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center gap-2 w-full sm:w-auto justify-end sm:justify-start pt-2.5 sm:pt-0 border-t sm:border-t-0 border-zinc-100 dark:border-zinc-800/60 shrink-0">
                    {/* Inline Preview Player Button */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        setActivePreviewLecture(activePreviewLecture?.id === lec.id ? null : lec)
                      }
                      className="text-xs rounded-full swiftui-press active:scale-[0.96]"
                      title="Watch inside app"
                    >
                      <Play className="w-3.5 h-3.5 mr-1" />
                      Preview
                    </Button>

                    {/* Watch on YouTube Link */}
                    <a
                      href={lec.videoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-red-600 hover:bg-red-700 text-white transition-all shadow-sm swiftui-press active:scale-[0.98]"
                      title="Watch Lecture on YouTube"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      YouTube
                      <ExternalLink className="w-3 h-3 opacity-80" />
                    </a>

                    {/* Cloud Synced Watched Toggle */}
                    <button
                      type="button"
                      onClick={() => toggleLectureWatched(lec.id)}
                      className={cn(
                        'inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all border swiftui-press active:scale-[0.98]',
                        lec.watched
                          ? 'bg-emerald-600 text-white border-emerald-600 hover:bg-emerald-700 shadow-sm'
                          : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                      )}
                      title={lec.watched ? 'Click to mark unwatched' : 'Click to mark as watched'}
                    >
                      {lec.watched ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 fill-current text-white" />
                          <span>Completed</span>
                        </>
                      ) : (
                        <>
                          <Circle className="w-4 h-4 text-zinc-400" />
                          <span>Mark Watched</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};

export default LecturesView;
