import React, { ButtonHTMLAttributes } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg' | 'icon';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  className,
  disabled,
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center font-medium rounded-full transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] active:scale-[0.97] disabled:opacity-50 disabled:pointer-events-none disabled:active:scale-100 select-none cursor-pointer';

  const variants: Record<ButtonVariant, string> = {
    primary:
      'bg-zinc-900 text-zinc-50 hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-white shadow-[0_2px_8px_rgba(0,0,0,0.08)] border border-transparent',
    secondary:
      'bg-zinc-200/80 hover:bg-zinc-200 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700 border border-black/[0.04] dark:border-white/[0.08]',
    outline:
      'bg-transparent text-zinc-800 dark:text-zinc-200 border border-zinc-300 dark:border-zinc-700 hover:bg-black/[0.04] dark:hover:bg-white/[0.06]',
    ghost:
      'bg-transparent text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800/60',
    danger:
      'bg-red-600 text-white hover:bg-red-700 shadow-sm border border-red-600/30',
  };

  const sizes: Record<ButtonSize, string> = {
    sm: 'text-xs px-3.5 py-1.5 min-h-[36px] gap-1.5',
    md: 'text-sm px-4.5 py-2 min-h-[44px] touch-target gap-2',
    lg: 'text-base px-6 py-2.5 min-h-[50px] gap-2.5',
    icon: 'p-2 min-h-[44px] min-w-[44px] touch-target',
  };

  return (
    <button
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && <Loader2 className="w-4 h-4 animate-spin text-current" />}
      {!isLoading && leftIcon && <span className="shrink-0">{leftIcon}</span>}
      {children}
      {!isLoading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
    </button>
  );
};
