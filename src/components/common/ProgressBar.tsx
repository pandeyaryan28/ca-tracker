import React from 'react';
import { SubjectId } from '@/types';
import { cn } from '@/lib/utils';

export interface ProgressBarProps {
  value: number; // 0 to 100
  max?: number;
  subjectId?: SubjectId;
  colorHex?: string;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  subjectId,
  colorHex,
  showLabel = false,
  size = 'md',
  className,
}) => {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  const heightClasses = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4',
  };

  const subjectColorClasses: Record<SubjectId, string> = {
    paper1: 'bg-emerald-500',
    paper2: 'bg-violet-500',
    paper3: 'bg-cyan-500',
    paper4: 'bg-amber-500',
  };

  const barColorClass = subjectId
    ? subjectColorClasses[subjectId]
    : 'bg-zinc-900 dark:bg-zinc-100';

  return (
    <div className={cn('w-full flex flex-col gap-1.5', className)}>
      {showLabel && (
        <div className="flex items-center justify-between text-xs font-medium text-zinc-600 dark:text-zinc-400 tabular-nums">
          <span>Progress</span>
          <span>{Math.round(percentage)}%</span>
        </div>
      )}
      <div
        className={cn(
          'w-full bg-zinc-200/60 dark:bg-zinc-800/60 rounded-full overflow-hidden p-0.5',
          heightClasses[size]
        )}
        role="progressbar"
        aria-valuenow={Math.round(percentage)}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className={cn(
            'h-full rounded-full transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]',
            barColorClass
          )}
          style={{
            width: `${percentage}%`,
            backgroundColor: colorHex,
          }}
        />
      </div>
    </div>
  );
};
