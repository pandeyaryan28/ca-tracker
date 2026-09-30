import React from 'react';
import { cn } from '@/lib/utils';

export interface RadialGaugeProps {
  percentage: number;
  size?: number; // default 120
  strokeWidth?: number; // default 8
  color: string;
  label?: string;
  sublabel?: string;
  className?: string;
  showPercentText?: boolean;
}

export const RadialGauge: React.FC<RadialGaugeProps> = ({
  percentage,
  size = 120,
  strokeWidth = 8,
  color,
  label,
  sublabel,
  className,
  showPercentText = true,
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clampedPct = Math.min(100, Math.max(0, isNaN(percentage) ? 0 : percentage));
  const strokeDashoffset = circumference * (1 - clampedPct / 100);

  return (
    <div className={cn('flex flex-col items-center justify-center', className)}>
      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        <svg
          className="w-full h-full transform -rotate-90"
          viewBox={`0 0 ${size} ${size}`}
          aria-label={`Progress gauge: ${clampedPct}%`}
        >
          {/* Background Track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            fill="transparent"
            className="text-zinc-200 dark:text-zinc-800"
          />
          {/* Animated Progress Stroke */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-700 ease-out"
          />
        </svg>

        {showPercentText && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-1">
            <span className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 tabular-nums">
              {clampedPct}%
            </span>
            {label && (
              <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">
                {label}
              </span>
            )}
          </div>
        )}
      </div>

      {sublabel && (
        <span className="text-xs text-zinc-600 dark:text-zinc-400 mt-2 font-medium text-center">
          {sublabel}
        </span>
      )}
    </div>
  );
};
