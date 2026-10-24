import React from 'react';
import { NavLink, useParams } from 'react-router-dom';
import { 
  LayoutDashboard, 
  PlusCircle, 
  FileCheck2, 
  UploadCloud, 
  AlertTriangle, 
  GitFork, 
  SlidersHorizontal, 
  FileText, 
  History, 
  Layers, 
  X,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { cn } from '../../utils/cn';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  activeCaseId?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, activeCaseId = 'LL-9041' }) => {
  const params = useParams();
  const caseId = params.id || activeCaseId;

  const mainNavigation = [
    {
      name: 'Dashboard',
      href: '/',
      icon: LayoutDashboard,
      badge: 'Live',
    },
    {
      name: 'New Loan Case',
      href: '/cases/new',
      icon: PlusCircle,
      badge: 'Intake',
    },
    {
      name: 'What-if Simulator',
      href: '/simulator',
      icon: SlidersHorizontal,
      badge: 'FOIR Tool',
    },
  ];

  const caseNavigation = [
    {
      name: 'Case Details',
      href: `/cases/${caseId}`,
      icon: FileCheck2,
      exact: true,
    },
    {
      name: 'Document Upload',
      href: `/cases/${caseId}/documents`,
      icon: UploadCloud,
    },
    {
      name: 'Findings Dashboard',
      href: `/cases/${caseId}/findings`,
      icon: AlertTriangle,
      badge: 'AI Signals',
    },
    {
      name: 'Evidence Graph',
      href: `/cases/${caseId}/evidence`,
      icon: GitFork,
      badge: 'Graph',
    },
    {
      name: 'CAM Preview',
      href: `/cases/${caseId}/cam`,
      icon: FileText,
      badge: 'Report',
    },
    {
      name: 'Audit Timeline',
      href: `/cases/${caseId}/audit`,
      icon: History,
      badge: 'Verifiable',
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-gray-900/40 backdrop-blur-sm lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar Panel */}
      <aside
        className={cn(
          'fixed lg:sticky top-0 left-0 z-40 h-screen w-64 bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800 transition-transform duration-300 ease-in-out flex flex-col',
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Brand Header */}
        <div className="h-16 px-6 flex items-center justify-between border-b border-gray-100 dark:border-gray-800">
          <NavLink to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-primary-700 via-primary to-blue-400 text-white flex items-center justify-center shadow-md shadow-primary/20 group-hover:scale-105 transition-transform">
              <Layers className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-base tracking-tight text-gray-900 dark:text-white">
                  LoanLens
                </span>
                <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded-md bg-primary text-white">
                  AI
                </span>
              </div>
              <p className="text-[10px] text-gray-400 tracking-wider uppercase font-medium">
                MSME Underwriting
              </p>
            </div>
          </NavLink>

          <button
            onClick={onClose}
            className="lg:hidden text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Navigation */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6">
          {/* Main Navigation */}
          <div>
            <div className="px-2 mb-2 text-[11px] font-bold tracking-wider uppercase text-gray-400 dark:text-gray-500">
              Overview & Tools
            </div>
            <nav className="space-y-1">
              {mainNavigation.map(item => (
                <NavLink
                  key={item.name}
                  to={item.href}
                  end={item.href === '/'}
                  onClick={() => onClose()}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 group',
                      isActive
                        ? 'bg-primary text-white shadow-sm shadow-primary/30'
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/80 hover:text-gray-900 dark:hover:text-white'
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      <div className="flex items-center gap-3">
                        <item.icon
                          className={cn(
                            'w-4 h-4 transition-colors',
                            isActive ? 'text-white' : 'text-gray-400 group-hover:text-primary dark:group-hover:text-primary-300'
                          )}
                        />
                        <span>{item.name}</span>
                      </div>
                      {item.badge && (
                        <span
                          className={cn(
                            'text-[10px] px-1.5 py-0.5 rounded-md font-medium',
                            isActive
                              ? 'bg-white/20 text-white'
                              : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'
                          )}
                        >
                          {item.badge}
                        </span>
                      )}
                    </>
                  )}
                </NavLink>
              ))}
            </nav>
          </div>

          {/* Active Case Navigation */}
          <div>
            <div className="px-2 mb-2 flex items-center justify-between text-[11px] font-bold tracking-wider uppercase text-gray-400 dark:text-gray-500">
              <span>Active Case Context</span>
              <span className="text-[10px] text-primary lowercase font-mono">#{caseId}</span>
            </div>

            <div className="mb-2 p-2.5 rounded-xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/50">
              <div className="text-xs font-bold text-gray-900 dark:text-white truncate">
                Case {caseId}
              </div>
              <div className="text-[11px] text-gray-500 dark:text-gray-400 truncate">
                Multi-Agent Underwriting Desk
              </div>
            </div>

            <nav className="space-y-1">
              {caseNavigation.map(item => (
                <NavLink
                  key={item.name}
                  to={item.href}
                  end={item.exact}
                  onClick={() => onClose()}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-150 group',
                      isActive
                        ? 'bg-primary text-white shadow-sm shadow-primary/30'
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/80 hover:text-gray-900 dark:hover:text-white'
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      <div className="flex items-center gap-3">
                        <item.icon
                          className={cn(
                            'w-4 h-4 transition-colors',
                            isActive ? 'text-white' : 'text-gray-400 group-hover:text-primary dark:group-hover:text-primary-300'
                          )}
                        />
                        <span>{item.name}</span>
                      </div>
                      {item.badge && (
                        <span
                          className={cn(
                            'text-[9px] px-1.5 py-0.5 rounded font-medium',
                            isActive
                              ? 'bg-white/20 text-white'
                              : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'
                          )}
                        >
                          {item.badge}
                        </span>
                      )}
                    </>
                  )}
                </NavLink>
              ))}
            </nav>
          </div>
        </div>

        {/* Footer info pill */}
        <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[11px] font-bold text-gray-900 dark:text-white truncate">
                RBI MSME Compliance
              </div>
              <div className="text-[10px] text-gray-500 dark:text-gray-400">
                Audited Agent Verifier v2.8
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
