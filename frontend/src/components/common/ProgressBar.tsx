import React from 'react';
import { cn } from '../../utils/cn';

export interface ProgressBarProps {
  value: number; // 0 to 100
  max?: number;
  label?: string;
  showPercent?: boolean;
  color?: 'primary' | 'success' | 'warning' | 'alert' | 'auto';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  label,
  showPercent = false,
  color = 'auto',
  size = 'md',
  className,
}) => {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  const heightClasses = {
    xs: 'h-1',
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4',
  };

  let fillColor = 'bg-primary';
  if (color === 'primary') fillColor = 'bg-primary';
  else if (color === 'success') fillColor = 'bg-emerald-500';
  else if (color === 'warning') fillColor = 'bg-amber-500';
  else if (color === 'alert') fillColor = 'bg-rose-500';
  else if (color === 'auto') {
    if (percentage > 80) fillColor = 'bg-emerald-500';
    else if (percentage > 50) fillColor = 'bg-blue-500';
    else if (percentage > 25) fillColor = 'bg-amber-500';
    else fillColor = 'bg-rose-500';
  }

  return (
    <div className={cn('w-full', className)}>
      {(label || showPercent) && (
        <div className="flex justify-between items-center text-xs text-gray-600 dark:text-gray-400 mb-1.5 font-medium">
          {label && <span>{label}</span>}
          {showPercent && <span>{percentage.toFixed(0)}%</span>}
        </div>
      )}
      <div className={cn('w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden', heightClasses[size])}>
        <div
          className={cn('h-full transition-all duration-500 ease-out rounded-full', fillColor)}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};
