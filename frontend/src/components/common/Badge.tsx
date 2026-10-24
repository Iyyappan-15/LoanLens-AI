import React from 'react';
import { cn } from '../../utils/cn';
import { CaseStatus, RiskLevel, SeverityType, RecommendationType } from '../../types';
import { ShieldCheck, AlertTriangle, ShieldAlert, CheckCircle2, Clock, AlertCircle } from 'lucide-react';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'alert' | 'gray';
  size?: 'xs' | 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  className,
  variant = 'secondary',
  size = 'sm',
  ...props
}) => {
  const sizeClasses = {
    xs: 'px-1.5 py-0.5 text-[10px]',
    sm: 'px-2.5 py-0.5 text-xs',
    md: 'px-3 py-1 text-xs',
  };

  const variantClasses = {
    primary: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800',
    secondary: 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-800',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800',
    warning: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800',
    alert: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-900/30 dark:text-rose-300 dark:border-rose-800',
    gray: 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 font-medium rounded-full border tracking-tight select-none',
        sizeClasses[size],
        variantClasses[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};

export const StatusBadge: React.FC<{ status: CaseStatus; className?: string }> = ({ status, className }) => {
  switch (status) {
    case 'Approved':
      return (
        <Badge variant="success" className={className}>
          <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
          <span>Approved</span>
        </Badge>
      );
    case 'Pending Review':
      return (
        <Badge variant="warning" className={className}>
          <Clock className="w-3 h-3 text-amber-600 dark:text-amber-400" />
          <span>Pending Review</span>
        </Badge>
      );
    case 'Under Investigation':
      return (
        <Badge variant="primary" className={className}>
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
          <span>Under Investigation</span>
        </Badge>
      );
    case 'Rejected':
      return (
        <Badge variant="alert" className={className}>
          <AlertCircle className="w-3 h-3 text-rose-600 dark:text-rose-400" />
          <span>Rejected</span>
        </Badge>
      );
    case 'Information Requested':
      return (
        <Badge variant="warning" className={className}>
          <AlertTriangle className="w-3 h-3 text-amber-600 dark:text-amber-400" />
          <span>Info Requested</span>
        </Badge>
      );
    default:
      return <Badge variant="gray" className={className}>{status}</Badge>;
  }
};

export const RiskBadge: React.FC<{ risk: RiskLevel; className?: string }> = ({ risk, className }) => {
  switch (risk) {
    case 'Low':
      return (
        <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800/40', className)}>
          <ShieldCheck className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
          Low Risk
        </span>
      );
    case 'Medium':
      return (
        <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200/60 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800/40', className)}>
          <AlertTriangle className="w-3 h-3 text-amber-600 dark:text-amber-400" />
          Medium Risk
        </span>
      );
    case 'High':
      return (
        <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-orange-50 text-orange-700 border border-orange-200/60 dark:bg-orange-950/40 dark:text-orange-400 dark:border-orange-800/40', className)}>
          <ShieldAlert className="w-3 h-3 text-orange-600 dark:text-orange-400" />
          High Risk
        </span>
      );
    case 'Critical':
      return (
        <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200/60 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800/40', className)}>
          <ShieldAlert className="w-3 h-3 text-rose-600 dark:text-rose-400" />
          Critical Risk
        </span>
      );
  }
};

export const SeverityBadge: React.FC<{ severity: SeverityType; className?: string }> = ({ severity, className }) => {
  switch (severity) {
    case 'Low':
      return <span className={cn('px-2 py-0.5 rounded-md text-[11px] font-semibold bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300', className)}>Low Severity</span>;
    case 'Medium':
      return <span className={cn('px-2 py-0.5 rounded-md text-[11px] font-semibold bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300', className)}>Medium Severity</span>;
    case 'High':
      return <span className={cn('px-2 py-0.5 rounded-md text-[11px] font-semibold bg-orange-50 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300', className)}>High Severity</span>;
    case 'Critical':
      return <span className={cn('px-2 py-0.5 rounded-md text-[11px] font-semibold bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300', className)}>Critical Severity</span>;
  }
};

export const RecommendationBadge: React.FC<{ recommendation: RecommendationType; className?: string }> = ({ recommendation, className }) => {
  switch (recommendation) {
    case 'Strong Approve':
    case 'Approve':
      return <span className={cn('px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300', className)}>{recommendation}</span>;
    case 'Conditional Approve':
      return <span className={cn('px-2.5 py-1 rounded-md text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300', className)}>{recommendation}</span>;
    case 'Manual Review':
      return <span className={cn('px-2.5 py-1 rounded-md text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300', className)}>{recommendation}</span>;
    case 'Reject':
      return <span className={cn('px-2.5 py-1 rounded-md text-xs font-semibold bg-rose-100 text-rose-800 dark:bg-rose-900/50 dark:text-rose-300', className)}>{recommendation}</span>;
  }
};
