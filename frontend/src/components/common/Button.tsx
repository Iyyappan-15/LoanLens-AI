import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '../../utils/cn';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'success' | 'ghost';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  className,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled,
  leftIcon,
  rightIcon,
  ...props
}) => {
  const sizeClasses = {
    xs: 'px-2.5 py-1 text-xs rounded-lg gap-1.5 font-medium',
    sm: 'px-3 py-1.5 text-xs rounded-lg gap-2 font-medium',
    md: 'px-4 py-2 text-sm rounded-xl gap-2 font-medium',
    lg: 'px-6 py-3 text-base rounded-xl gap-2.5 font-semibold',
  };

  const variantClasses = {
    primary:
      'bg-primary hover:bg-primary-600 active:bg-primary-700 text-white shadow-sm hover:shadow transition-all duration-150 focus:ring-2 focus:ring-primary/40 focus:outline-none',
    secondary:
      'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-150',
    outline:
      'border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-150',
    danger:
      'bg-alert hover:bg-alert-dark text-white shadow-sm hover:shadow focus:ring-2 focus:ring-alert/40 transition-all duration-150',
    success:
      'bg-success hover:bg-success-dark text-white shadow-sm hover:shadow focus:ring-2 focus:ring-success/40 transition-all duration-150',
    ghost:
      'bg-transparent text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-150',
  };

  return (
    <button
      disabled={disabled || isLoading}
      className={cn(
        'inline-flex items-center justify-center select-none transition-all duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed',
        sizeClasses[size],
        variantClasses[variant],
        className
      )}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin text-current" />
      ) : (
        leftIcon && <span className="flex-shrink-0">{leftIcon}</span>
      )}
      <span>{children}</span>
      {!isLoading && rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
    </button>
  );
};
