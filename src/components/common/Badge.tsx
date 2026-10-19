import React, { HTMLAttributes } from 'react';
import { SubjectId, TopicStatus } from '@/types';
import { cn } from '@/lib/utils';

export type BadgeVariant =
  | 'default'
  | 'outline'
  | 'pending'
  | 'in_progress'
  | 'completed'
  | 'paper1'
  | 'paper2'
  | 'paper3'
  | 'paper4'
  | 'success'
  | 'warning'
  | 'danger';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  status?: TopicStatus;
  subjectId?: SubjectId;
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  status,
  subjectId,
  size = 'md',
  className,
  ...props
}) => {
  let activeVariant = variant;
  if (status) {
    activeVariant = status;
  } else if (subjectId) {
    activeVariant = subjectId;
  }

  const baseStyles =
    'inline-flex items-center justify-center font-medium rounded-full tracking-tight transition-all select-none';

  const sizes = {
    sm: 'text-[10px] px-2.5 py-0.5 leading-tight',
    md: 'text-xs px-3 py-1 leading-tight',
  };

  const variants: Record<BadgeVariant, string> = {
    default:
      'bg-zinc-500/10 text-zinc-800 dark:text-zinc-200 border border-black/5 dark:border-white/10',
    outline:
      'bg-transparent text-zinc-700 dark:text-zinc-300 border border-black/10 dark:border-white/15',
    pending:
      'bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 border border-black/5 dark:border-white/10',
    in_progress:
      'bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-500/20',
    completed:
      'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20',
    paper1:
      'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20',
    paper2:
      'bg-violet-500/10 text-violet-700 dark:text-violet-300 border border-violet-500/20',
    paper3:
      'bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 border border-cyan-500/20',
    paper4:
      'bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20',
    success:
      'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20',
    warning:
      'bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20',
    danger:
      'bg-red-500/10 text-red-700 dark:text-red-300 border border-red-500/20',
  };

  return (
    <span
      className={cn(baseStyles, sizes[size], variants[activeVariant] || variants.default, className)}
      {...props}
    >
      {children}
    </span>
  );
};
