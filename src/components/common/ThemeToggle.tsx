import React from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { AppTheme } from '@/types';
import { cn } from '@/lib/utils';

interface ThemeToggleProps {
  className?: string;
  showSegmented?: boolean;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  className,
  showSegmented = false,
}) => {
  const { theme, resolvedTheme, setTheme, toggleTheme } = useTheme();

  if (showSegmented) {
    const options: { value: AppTheme; label: string; icon: React.ReactNode }[] = [
      { value: 'light', label: 'Light', icon: <Sun className="w-4 h-4" /> },
      { value: 'system', label: 'Auto', icon: <Monitor className="w-4 h-4" /> },
      { value: 'dark', label: 'Dark', icon: <Moon className="w-4 h-4" /> },
    ];

    return (
      <div
        className={cn(
          'inline-flex items-center p-1 rounded-xl bg-zinc-200/60 dark:bg-zinc-800/80 border border-zinc-300/40 dark:border-zinc-700/40 backdrop-blur-md',
          className
        )}
        role="group"
        aria-label="Theme selector"
      >
        {options.map((opt) => {
          const isActive = theme === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => setTheme(opt.value)}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 min-h-[36px] touch-target',
                isActive
                  ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50 shadow-sm border border-zinc-200/80 dark:border-zinc-700/80 scale-[1.02]'
                  : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200'
              )}
              aria-pressed={isActive}
            >
              {opt.icon}
              <span>{opt.label}</span>
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={cn(
        'touch-target p-2 rounded-xl text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-200/60 dark:hover:bg-zinc-800/60 border border-transparent hover:border-zinc-300/50 dark:hover:border-zinc-700/50 transition-all duration-200 active:scale-95',
        className
      )}
      aria-label={`Switch to ${resolvedTheme === 'dark' ? 'light' : 'dark'} mode`}
      title={`Switch to ${resolvedTheme === 'dark' ? 'light' : 'dark'} mode`}
    >
      {resolvedTheme === 'dark' ? (
        <Sun className="w-5 h-5 transition-transform duration-300 rotate-0 hover:rotate-45 text-amber-400" />
      ) : (
        <Moon className="w-5 h-5 transition-transform duration-300 rotate-0 hover:-rotate-12 text-zinc-700" />
      )}
    </button>
  );
};
