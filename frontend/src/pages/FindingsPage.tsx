import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  AlertTriangle, 
  ShieldAlert, 
  TrendingDown, 
  GitCompare, 
  FileQuestion, 
  Copy, 
  ExternalLink, 
  CheckCircle2, 
  Filter, 
  SlidersHorizontal,
  Sparkles,
  Search,
  Eye,
  Check
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { SeverityBadge } from '../components/common/Badge';
import { ProgressBar } from '../components/common/ProgressBar';
import { Breadcrumb } from '../components/common/Breadcrumb';
import { EmptyState } from '../components/common/EmptyState';
import { CardSkeleton } from '../components/common/Skeleton';
import { useToast } from '../hooks/useToast';
import { api } from '../services/api';
import { Finding, FindingCategory, SeverityType } from '../types';
import { formatDate } from '../utils/formatters';

const CATEGORIES: (FindingCategory | 'All')[] = [
  'All',
  'Fraud Alerts',
  'Cash Flow Analysis',
  'GST Reconciliation',
  'Missing Documents',
  'Duplicate Transactions',
];

export const FindingsPage: React.FC = () => {
  const params = useParams();
  const navigate = useNavigate();
  const caseId = params.id || 'LL-9041';
  const { success, info } = useToast();

  const [findings, setFindings] = useState<Finding[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<FindingCategory | 'All'>('All');
  const [selectedSeverity, setSelectedSeverity] = useState<SeverityType | 'All'>('All');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadFindings();
  }, [caseId]);

  const loadFindings = async () => {
    setLoading(true);
    try {
      const data = await api.getFindings({ caseId });
      setFindings(data);
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = (id: string, title: string) => {
    setFindings(prev =>
      prev.map(f => (f.id === id ? { ...f, status: 'Resolved' as const } : f))
    );
    success('Finding Marked Resolved', `Underwriter resolution recorded for "${title}".`);
  };

  const filteredFindings = findings.filter(f => {
    const matchCategory = selectedCategory === 'All' || f.category === selectedCategory;
    const matchSeverity = selectedSeverity === 'All' || f.severity === selectedSeverity;
    const matchSearch =
      f.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.agentSource.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSeverity && matchSearch;
  });

  const getCategoryIcon = (category: FindingCategory) => {
    switch (category) {
      case 'Fraud Alerts':
        return <ShieldAlert className="w-4 h-4 text-rose-500" />;
      case 'Cash Flow Analysis':
        return <TrendingDown className="w-4 h-4 text-amber-500" />;
      case 'GST Reconciliation':
        return <GitCompare className="w-4 h-4 text-blue-500" />;
      case 'Missing Documents':
        return <FileQuestion className="w-4 h-4 text-orange-500" />;
      case 'Duplicate Transactions':
        return <Copy className="w-4 h-4 text-purple-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <Breadcrumb
        items={[
          { label: 'Cases' },
          { label: `Case ${caseId}`, href: `/cases/${caseId}` },
          { label: 'Autonomous Agent Findings & Audit Signals' },
        ]}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-gray-100 dark:border-gray-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
              Autonomous Agent Findings & Signals
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full font-mono bg-blue-50 dark:bg-blue-950/40 text-primary border border-blue-200 dark:border-blue-900">
              {caseId}
            </span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Real-time synthesis across Fraud Detective, Cash Flow, GST Reconciliation, and Policy Agents.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => navigate(`/cases/${caseId}/evidence`)}
            leftIcon={<ExternalLink className="w-4 h-4" />}
          >
            Inspect Evidence Graph
          </Button>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Category Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-gray-100 dark:bg-gray-800/60 rounded-xl">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                selectedCategory === cat
                  ? 'bg-white dark:bg-gray-900 text-primary shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Severity Filter & Search */}
        <div className="flex items-center gap-2">
          <select
            value={selectedSeverity}
            onChange={e => setSelectedSeverity(e.target.value as any)}
            className="text-xs py-1.5 px-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 focus:outline-none"
          >
            <option value="All">All Severities</option>
            <option value="Critical">Critical Only</option>
            <option value="High">High Severity</option>
            <option value="Medium">Medium Severity</option>
            <option value="Low">Low Severity</option>
          </select>

          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-gray-400" />
            <input
              type="text"
              placeholder="Search findings..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary w-44 sm:w-56"
            />
          </div>
        </div>
      </div>

      {/* Findings Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <CardSkeleton rows={3} />
          <CardSkeleton rows={3} />
        </div>
      ) : filteredFindings.length === 0 ? (
        <EmptyState
          title="No Findings Match Filter"
          description="Autonomous verification agents discovered zero adverse signals in this category."
          actionLabel="Clear Filters"
          onAction={() => {
            setSelectedCategory('All');
            setSelectedSeverity('All');
            setSearchQuery('');
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredFindings.map(finding => {
            const isResolved = finding.status === 'Resolved';

            return (
              <Card
                key={finding.id}
                hoverable
                className={`flex flex-col justify-between border-l-4 ${
                  finding.severity === 'Critical'
                    ? 'border-l-rose-500'
                    : finding.severity === 'High'
                    ? 'border-l-orange-500'
                    : finding.severity === 'Medium'
                    ? 'border-l-amber-500'
                    : 'border-l-blue-500'
                }`}
              >
                <CardHeader className="items-start gap-2">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
                      {getCategoryIcon(finding.category)}
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                        {finding.category}
                      </span>
                      <h3 className="text-sm font-bold text-gray-900 dark:text-white leading-snug">
                        {finding.title}
                      </h3>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <SeverityBadge severity={finding.severity} />
                  </div>
                </CardHeader>

                <CardContent className="space-y-4 flex-1">
                  <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
                    {finding.description}
                  </p>

                  {/* Evidence Snippet */}
                  {finding.evidenceSnippet && (
                    <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-800 font-mono text-[11px] text-gray-700 dark:text-gray-300">
                      <span className="text-[10px] text-gray-400 uppercase font-sans font-bold block mb-1">
                        Detected Evidence:
                      </span>
                      {finding.evidenceSnippet}
                    </div>
                  )}

                  {/* Agent Metadata & Confidence Score */}
                  <div className="space-y-1.5 pt-2">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-gray-500 flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-primary" /> {finding.agentSource}
                      </span>
                      <span className="font-semibold text-gray-700 dark:text-gray-300">
                        {finding.confidenceScore}% Confidence
                      </span>
                    </div>
                    <ProgressBar value={finding.confidenceScore} color="primary" size="xs" />
                  </div>
                </CardContent>

                <CardFooter className="py-3 px-5 text-xs flex items-center justify-between">
                  <button
                    onClick={() => navigate(finding.evidenceLink)}
                    className="text-primary hover:text-primary-700 font-semibold flex items-center gap-1 transition-colors"
                  >
                    View in Graph <ExternalLink className="w-3.5 h-3.5" />
                  </button>

                  {isResolved ? (
                    <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
                      <Check className="w-3.5 h-3.5" /> Resolved
                    </span>
                  ) : (
                    <Button
                      variant="ghost"
                      size="xs"
                      onClick={() => handleResolve(finding.id, finding.title)}
                      leftIcon={<CheckCircle2 className="w-3 h-3 text-emerald-500" />}
                    >
                      Mark Reviewed
                    </Button>
                  )}
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
