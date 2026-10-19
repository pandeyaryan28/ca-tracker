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
        'rounded-2xl p-4 sm:p-6 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]',
        glass
          ? 'glass-panel bg-white/75 dark:bg-zinc-900/60 backdrop-blur-2xl border border-black/[0.05] dark:border-white/10 shadow-[0_8px_30px_rgb(0,0,0,0.03)] dark:shadow-[0_12px_40px_rgb(0,0,0,0.45)] shadow-[inset_0_1px_1px_0_rgba(255,255,255,0.4)] dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08)]'
          : 'bg-white dark:bg-zinc-900 shadow-sm border border-zinc-200/80 dark:border-zinc-800',
        hoverEffect &&
          'hover:border-zinc-300 dark:hover:border-white/20 hover:bg-white/90 dark:hover:bg-zinc-900/80 hover:shadow-lg dark:hover:shadow-zinc-950/60 cursor-pointer swiftui-press active:scale-[0.99]',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
