import React, { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hoverEffect?: boolean;
  glass?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className,
  hoverEffect = false,
  glass = true,
  ...props
}) => {
  return (
    <div
      className={cn(
        'rounded-2xl p-4 sm:p-6 transition-all duration-200 border-hairline',
        glass
          ? 'glass-panel shadow-apple-card dark:shadow-apple-card-dark'
          : 'bg-white dark:bg-zinc-900 shadow-sm border border-zinc-200 dark:border-zinc-800',
        hoverEffect &&
          'hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-md dark:hover:shadow-zinc-950/50 cursor-pointer active:scale-[0.995]',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
