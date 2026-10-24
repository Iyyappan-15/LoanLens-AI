import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  Bell, 
  Moon, 
  Sun, 
  Menu, 
  ShieldCheck, 
  ChevronDown, 
  LogOut, 
  User, 
  CheckCheck,
  Building,
  FileText
} from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';
import { currentUser, mockNotifications, mockLoanCases } from '../../services/mockData';
import { UserNotification } from '../../types';

interface NavbarProps {
  onMenuToggle: () => void;
  activeCaseId?: string;
  onSelectCase?: (caseId: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onMenuToggle, activeCaseId = 'LL-9041', onSelectCase }) => {
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Notifications state
  const [notifications, setNotifications] = useState<UserNotification[]>(mockNotifications);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  // User menu state
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close popups on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsSearchOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setIsNotifOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const filteredCases = searchQuery.trim()
    ? mockLoanCases.filter(
        c =>
          c.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.applicant.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.business.legalName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.business.gstin.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const handleSelectSearchResult = (caseId: string) => {
    setIsSearchOpen(false);
    setSearchQuery('');
    if (onSelectCase) onSelectCase(caseId);
    navigate(`/cases/${caseId}`);
  };

  const handleLogout = () => {
    localStorage.removeItem('loanlens_auth_token');
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 transition-colors">
      <div className="flex items-center justify-between h-full px-4 sm:px-6">
        {/* Left: Hamburger & Quick Search */}
        <div className="flex items-center gap-3 flex-1 max-w-xl">
          <button
            onClick={onMenuToggle}
            className="lg:hidden p-2 rounded-xl text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Toggle Navigation"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Search Bar with instant autocomplete */}
          <div ref={searchRef} className="relative w-full max-w-md hidden sm:block">
            <div className="relative flex items-center">
              <Search className="absolute left-3 w-4 h-4 text-gray-400 dark:text-gray-500 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => {
                  setSearchQuery(e.target.value);
                  setIsSearchOpen(true);
                }}
                onFocus={() => setIsSearchOpen(true)}
                placeholder="Search cases, GSTIN, promoter or company..."
                className="w-full bg-gray-50 dark:bg-gray-800/80 border border-gray-200/80 dark:border-gray-700/80 rounded-xl pl-9 pr-4 py-1.5 text-xs text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
              <kbd className="absolute right-3 hidden md:inline-flex items-center px-1.5 py-0.5 text-[10px] text-gray-400 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded">
                ⌘K
              </kbd>
            </div>

            {/* Search Dropdown */}
            {isSearchOpen && searchQuery.trim() && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-soft-lg py-2 z-50 overflow-hidden max-h-80 overflow-y-auto">
                <div className="px-3 py-1 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                  Cases Matching "{searchQuery}"
                </div>
                {filteredCases.length === 0 ? (
                  <div className="px-4 py-6 text-center text-xs text-gray-500 dark:text-gray-400">
                    No loan cases or files found matching your query
                  </div>
                ) : (
                  filteredCases.map(c => (
                    <button
                      key={c.id}
                      onClick={() => handleSelectSearchResult(c.id)}
                      className="w-full px-3 py-2.5 flex items-center justify-between text-left hover:bg-gray-50 dark:hover:bg-gray-800/80 transition-colors border-b border-gray-50 dark:border-gray-800/40 last:border-0"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-primary flex items-center justify-center font-bold text-xs">
                          {c.id.substring(3)}
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                            {c.business.legalName}
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
                              {c.id}
                            </span>
                          </div>
                          <div className="text-[11px] text-gray-500 dark:text-gray-400 flex items-center gap-2 mt-0.5">
                            <span>Promoter: {c.applicant.fullName}</span>
                            <span>•</span>
                            <span>₹{(c.loanRequest.amount / 100000).toFixed(1)}L</span>
                          </div>
                        </div>
                      </div>
                      <span className="text-[10px] font-medium text-primary">View →</span>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right side controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Active Case Selector Pill */}
          <div className="hidden xl:flex items-center gap-2 px-3 py-1 bg-gray-50 dark:bg-gray-800/70 border border-gray-200/80 dark:border-gray-700/80 rounded-xl text-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-gray-500 dark:text-gray-400">Current Case:</span>
            <select
              value={activeCaseId}
              onChange={e => {
                if (onSelectCase) onSelectCase(e.target.value);
                navigate(`/cases/${e.target.value}`);
              }}
              className="bg-transparent text-gray-900 dark:text-white font-medium focus:outline-none cursor-pointer text-xs"
            >
              {mockLoanCases.map(c => (
                <option key={c.id} value={c.id} className="dark:bg-gray-900 text-gray-900 dark:text-white">
                  {c.id} - {c.business.legalName.substring(0, 24)}...
                </option>
              ))}
            </select>
          </div>

          {/* AI Underwriting Engine Status Badge */}
          <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 text-xs font-medium">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>AI Agents Online</span>
          </div>

          {/* Dark Mode Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Toggle color theme"
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Notifications Dropdown */}
          <div ref={notifRef} className="relative">
            <button
              onClick={() => setIsNotifOpen(prev => !prev)}
              className="relative p-2 rounded-xl text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-accent animate-pulse" />
              )}
            </button>

            {isNotifOpen && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-soft-lg z-50 overflow-hidden">
                <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Audit Notifications</h4>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400">
                      {unreadCount} unread automated underwriting signals
                    </p>
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="text-xs text-primary hover:text-primary-600 flex items-center gap-1 font-medium"
                    >
                      <CheckCheck className="w-3.5 h-3.5" /> Mark all read
                    </button>
                  )}
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-gray-50 dark:divide-gray-800/40">
                  {notifications.map(n => (
                    <div
                      key={n.id}
                      onClick={() => {
                        if (n.caseId) {
                          setIsNotifOpen(false);
                          navigate(`/cases/${n.caseId}`);
                        }
                      }}
                      className={`p-3.5 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer transition-colors ${
                        !n.read ? 'bg-blue-50/30 dark:bg-blue-950/20' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-xs font-semibold text-gray-900 dark:text-white">
                          {n.title}
                        </span>
                        <span className="text-[10px] text-gray-400 whitespace-nowrap">{n.timestamp}</span>
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-300 mt-1 leading-relaxed">
                        {n.message}
                      </p>
                      {n.caseId && (
                        <span className="inline-block mt-2 text-[10px] text-primary font-medium hover:underline">
                          Inspect Case {n.caseId} →
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* User Profile Pill & Dropdown */}
          <div ref={userMenuRef} className="relative">
            <button
              onClick={() => setIsUserMenuOpen(prev => !prev)}
              className="flex items-center gap-2.5 p-1.5 pl-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <img
                src={currentUser.avatarUrl}
                alt={currentUser.name}
                className="w-7 h-7 rounded-full object-cover ring-1 ring-gray-200 dark:ring-gray-700"
              />
              <div className="hidden sm:block text-left">
                <div className="text-xs font-semibold text-gray-900 dark:text-white leading-tight">
                  {currentUser.name.split(' ')[0]}
                </div>
                <div className="text-[10px] text-gray-500 dark:text-gray-400 leading-tight">
                  Senior Underwriter
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
            </button>

            {isUserMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-soft-lg py-1.5 z-50">
                <div className="px-4 py-2.5 border-b border-gray-100 dark:border-gray-800">
                  <div className="text-xs font-bold text-gray-900 dark:text-white">{currentUser.name}</div>
                  <div className="text-[11px] text-gray-500 dark:text-gray-400 truncate">{currentUser.email}</div>
                  <div className="mt-1 text-[10px] text-emerald-600 font-medium">Bank Role: {currentUser.role}</div>
                </div>

                <div className="py-1">
                  <button
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      navigate('/');
                    }}
                    className="w-full px-4 py-2 text-xs text-left text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center gap-2"
                  >
                    <Building className="w-3.5 h-3.5 text-gray-400" /> Underwriting Dashboard
                  </button>
                  <button
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      navigate('/cases/new');
                    }}
                    className="w-full px-4 py-2 text-xs text-left text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center gap-2"
                  >
                    <FileText className="w-3.5 h-3.5 text-gray-400" /> New Loan Case
                  </button>
                </div>

                <div className="border-t border-gray-100 dark:border-gray-800 pt-1">
                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-2 text-xs text-left text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 flex items-center gap-2 font-medium"
                  >
                    <LogOut className="w-3.5 h-3.5" /> Sign Out Session
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
