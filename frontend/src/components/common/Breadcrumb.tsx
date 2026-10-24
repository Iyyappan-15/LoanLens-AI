import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '../../utils/cn';

export interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: React.ReactNode;
}

export interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({ items, className }) => {
  return (
    <nav className={cn('flex items-center text-xs text-gray-500 dark:text-gray-400', className)}>
      <Link
        to="/"
        className="flex items-center gap-1 hover:text-primary dark:hover:text-primary-300 transition-colors"
      >
        <Home className="w-3.5 h-3.5" />
        <span className="sr-only">Dashboard</span>
      </Link>
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <React.Fragment key={index}>
            <ChevronRight className="w-3.5 h-3.5 mx-2 text-gray-400 dark:text-gray-600 flex-shrink-0" />
            {isLast || !item.href ? (
              <span className="font-semibold text-gray-900 dark:text-white flex items-center gap-1.5 truncate max-w-[200px] sm:max-w-none">
                {item.icon}
                {item.label}
              </span>
            ) : (
              <Link
                to={item.href}
                className="hover:text-primary dark:hover:text-primary-300 transition-colors flex items-center gap-1.5"
              >
                {item.icon}
                {item.label}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};
