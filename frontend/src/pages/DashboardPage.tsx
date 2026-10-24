import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FileStack, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownRight, 
  Search, 
  Filter, 
  SlidersHorizontal, 
  ExternalLink, 
  Plus, 
  ArrowUpDown,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Layers,
  Sparkles
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip as RechartsTooltip, 
  Cell, 
  PieChart, 
  Pie, 
  Legend 
} from 'recharts';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { StatusBadge, RiskBadge } from '../components/common/Badge';
import { CardSkeleton } from '../components/common/Skeleton';
import { EmptyState } from '../components/common/EmptyState';
import { api } from '../services/api';
import { LoanCase, RiskLevel, CaseStatus } from '../types';
import { formatCurrency, formatCompactINR } from '../utils/formatters';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [cases, setCases] = useState<LoanCase[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [riskFilter, setRiskFilter] = useState<string>('All');
  const [sortField, setSortField] = useState<'createdAt' | 'amount' | 'foir'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  useEffect(() => {
    loadCases();
  }, []);

  const loadCases = async () => {
    setLoading(true);
    try {
      const data = await api.getCases();
      setCases(data);
    } finally {
      setLoading(false);
    }
  };

  // Filtered & Sorted Cases
  const filteredCases = cases.filter(c => {
    const matchesSearch =
      c.id.toLowerCase().includes(search.toLowerCase()) ||
      c.business.legalName.toLowerCase().includes(search.toLowerCase()) ||
      c.applicant.fullName.toLowerCase().includes(search.toLowerCase()) ||
      c.business.gstin.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === 'All' || c.status === statusFilter;
    const matchesRisk = riskFilter === 'All' || c.riskLevel === riskFilter;

    return matchesSearch && matchesStatus && matchesRisk;
  }).sort((a, b) => {
    if (sortField === 'amount') {
      return sortOrder === 'asc'
        ? a.loanRequest.amount - b.loanRequest.amount
        : b.loanRequest.amount - a.loanRequest.amount;
    }
    if (sortField === 'foir') {
      return sortOrder === 'asc'
        ? a.financials.foir - b.financials.foir
        : b.financials.foir - a.financials.foir;
    }
    // Default createdAt
    return sortOrder === 'asc'
      ? new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const totalPages = Math.ceil(filteredCases.length / pageSize) || 1;
  const paginatedCases = filteredCases.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // Statistics calculation
  const totalCasesCount = cases.length;
  const pendingReviewsCount = cases.filter(c => c.status === 'Pending Review' || c.status === 'Under Investigation').length;
  const approvedCount = cases.filter(c => c.status === 'Approved').length;
  const highRiskCount = cases.filter(c => c.riskLevel === 'High' || c.riskLevel === 'Critical').length;
  const totalSanctionedVolume = cases
    .filter(c => c.status === 'Approved')
    .reduce((sum, c) => sum + c.loanRequest.amount, 0);

  // Chart Data: Risk Distribution
  const riskDistributionData = [
    { name: 'Low Risk', count: cases.filter(c => c.riskLevel === 'Low').length, color: '#2E7D32' },
    { name: 'Medium Risk', count: cases.filter(c => c.riskLevel === 'Medium').length, color: '#F57C00' },
    { name: 'High Risk', count: cases.filter(c => c.riskLevel === 'High').length, color: '#FF3D00' },
    { name: 'Critical', count: cases.filter(c => c.riskLevel === 'Critical').length, color: '#E53935' },
  ];

  // Chart Data: Status Pie
  const statusPieData = [
    { name: 'Approved', value: cases.filter(c => c.status === 'Approved').length, color: '#2E7D32' },
    { name: 'Under Investigation', value: cases.filter(c => c.status === 'Under Investigation').length, color: '#1E88E5' },
    { name: 'Pending Review', value: cases.filter(c => c.status === 'Pending Review').length, color: '#F57C00' },
    { name: 'Rejected', value: cases.filter(c => c.status === 'Rejected').length, color: '#E53935' },
  ];

  // Recent Activity Events
  const recentActivities = [
    {
      id: 'act-1',
      title: 'Apex Precision Engineering: CAM Generated',
      time: '12 mins ago',
      desc: 'All 5 agents completed clearance. CR-1 rating proposed.',
      caseId: 'LL-9041',
      type: 'success',
    },
    {
      id: 'act-2',
      title: 'Fraud Alert: Sandhu Fabricators',
      time: '45 mins ago',
      desc: 'Circular trading detected between related GSTIN entities.',
      caseId: 'LL-9039',
      type: 'alert',
    },
    {
      id: 'act-3',
      title: 'Sanction Mandate Executed',
      time: '2 hours ago',
      desc: '₹80 Lakhs working capital loan approved for Shanti Organics.',
      caseId: 'LL-9038',
      type: 'info',
    },
    {
      id: 'act-4',
      title: 'Document OCR Ingestion Done',
      time: '4 hours ago',
      desc: 'Nova Logix: 12-month current account statement extracted (412 txns).',
      caseId: 'LL-9042',
      type: 'info',
    },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <CardSkeleton rows={1} />
          <CardSkeleton rows={1} />
          <CardSkeleton rows={1} />
          <CardSkeleton rows={1} />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8"><CardSkeleton rows={4} /></div>
          <div className="lg:col-span-4"><CardSkeleton rows={4} /></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Banner: Greeting & Quick Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-gray-100 dark:border-gray-800">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight flex items-center gap-2.5">
            MSME Underwriting Dashboard
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/40 text-primary border border-blue-200 dark:border-blue-900 font-medium">
              Q4 FY26 Active
            </span>
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Real-time pipeline overview, autonomous agent findings, and underwriting status.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/simulator')}
            leftIcon={<SlidersHorizontal className="w-4 h-4" />}
          >
            What-if Simulator
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate('/cases/new')}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            New Loan Case
          </Button>
        </div>
      </div>

      {/* 4 Key Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Cases */}
        <Card hoverable className="border-l-4 border-l-primary">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Total Cases
              </span>
              <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-primary flex items-center justify-center">
                <FileStack className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-gray-900 dark:text-white">
                {totalCasesCount}
              </span>
              <span className="inline-flex items-center text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                <ArrowUpRight className="w-3.5 h-3.5" /> +14.2%
              </span>
            </div>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">
              Active files in current lending cycle
            </p>
          </CardContent>
        </Card>

        {/* Pending Reviews */}
        <Card hoverable className="border-l-4 border-l-amber-500">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Pending Reviews
              </span>
              <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-gray-900 dark:text-white">
                {pendingReviewsCount}
              </span>
              <span className="text-[11px] font-medium text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-1.5 py-0.5 rounded">
                Action Required
              </span>
            </div>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">
              CAM synthesis ready for approval
            </p>
          </CardContent>
        </Card>

        {/* Approved */}
        <Card hoverable className="border-l-4 border-l-success">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Approved Volume
              </span>
              <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatCompactINR(totalSanctionedVolume)}
              </span>
              <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                ({approvedCount} cases)
              </span>
            </div>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">
              Sanction letters issued to borrowers
            </p>
          </CardContent>
        </Card>

        {/* High Risk */}
        <Card hoverable className="border-l-4 border-l-alert">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                High / Critical Risk
              </span>
              <div className="w-9 h-9 rounded-xl bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                <AlertTriangle className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-rose-600 dark:text-rose-400">
                {highRiskCount}
              </span>
              <span className="text-[11px] font-medium text-rose-600 bg-rose-50 dark:bg-rose-950/40 px-1.5 py-0.5 rounded">
                Fraud/Deficit Flags
              </span>
            </div>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">
              Autonomous fraud agent alerts active
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Visual Analytics Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Risk Distribution Chart */}
        <Card className="lg:col-span-7">
          <CardHeader>
            <div>
              <CardTitle>Risk Categorization Distribution</CardTitle>
              <CardDescription>
                AI credit risk grading across current portfolio
              </CardDescription>
            </div>
            <div className="text-xs text-primary font-medium flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Model v4.2
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={riskDistributionData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis 
                    dataKey="name" 
                    tick={{ fontSize: 11, fill: '#888888' }} 
                    axisLine={{ stroke: '#E5E7EB' }} 
                  />
                  <YAxis 
                    tick={{ fontSize: 11, fill: '#888888' }} 
                    axisLine={{ stroke: '#E5E7EB' }} 
                    allowDecimals={false} 
                  />
                  <RechartsTooltip
                    contentStyle={{
                      backgroundColor: '#1F2937',
                      borderColor: '#374151',
                      borderRadius: '10px',
                      color: '#FFFFFF',
                      fontSize: '12px',
                    }}
                  />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                    {riskDistributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Loan Status Pie Chart */}
        <Card className="lg:col-span-5">
          <CardHeader>
            <div>
              <CardTitle>Loan Case Pipeline Status</CardTitle>
              <CardDescription>Breakdown by stage of underwriter review</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-64 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {statusPieData.map((entry, index) => (
                      <Cell key={`slice-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip
                    contentStyle={{
                      backgroundColor: '#1F2937',
                      borderColor: '#374151',
                      borderRadius: '10px',
                      color: '#FFFFFF',
                      fontSize: '12px',
                    }}
                  />
                  <Legend 
                    verticalAlign="bottom" 
                    height={36} 
                    iconType="circle"
                    formatter={(val) => <span className="text-xs text-gray-700 dark:text-gray-300 font-medium">{val}</span>} 
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cases Table + Activity Stream Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recent Cases Table */}
        <Card className="lg:col-span-8">
          <CardHeader className="flex-col sm:flex-row items-start sm:items-center gap-3">
            <div>
              <CardTitle>Recent MSME Applications</CardTitle>
              <CardDescription>
                Browse active credit cases with risk scorecards & quick inspection
              </CardDescription>
            </div>

            {/* Table Action Controls */}
            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              {/* Search */}
              <div className="relative flex-1 sm:w-48">
                <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Filter cases..."
                  value={search}
                  onChange={e => {
                    setSearch(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={e => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="text-xs py-1.5 px-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 focus:outline-none"
              >
                <option value="All">All Statuses</option>
                <option value="Approved">Approved</option>
                <option value="Pending Review">Pending Review</option>
                <option value="Under Investigation">Under Investigation</option>
                <option value="Rejected">Rejected</option>
              </select>

              {/* Risk Filter */}
              <select
                value={riskFilter}
                onChange={e => {
                  setRiskFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="text-xs py-1.5 px-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 focus:outline-none"
              >
                <option value="All">All Risks</option>
                <option value="Low">Low Risk</option>
                <option value="Medium">Medium Risk</option>
                <option value="High">High Risk</option>
                <option value="Critical">Critical</option>
              </select>
            </div>
          </CardHeader>

          <CardContent className="p-0 overflow-x-auto">
            {paginatedCases.length === 0 ? (
              <EmptyState
                title="No loan cases found"
                description="No MSME cases match your search criteria. Try modifying your filters."
                actionLabel="Clear Filters"
                onAction={() => {
                  setSearch('');
                  setStatusFilter('All');
                  setRiskFilter('All');
                }}
              />
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50/60 dark:bg-gray-800/40 text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    <th className="py-3 px-4">Case ID</th>
                    <th className="py-3 px-4">Business & Promoter</th>
                    <th 
                      className="py-3 px-4 cursor-pointer hover:text-primary transition-colors"
                      onClick={() => {
                        setSortField('amount');
                        setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                      }}
                    >
                      <div className="flex items-center gap-1">
                        Amount
                        <ArrowUpDown className="w-3 h-3" />
                      </div>
                    </th>
                    <th className="py-3 px-4">FOIR</th>
                    <th className="py-3 px-4">Risk Level</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800/60 text-xs">
                  {paginatedCases.map(c => (
                    <tr
                      key={c.id}
                      onClick={() => navigate(`/cases/${c.id}`)}
                      className="hover:bg-blue-50/40 dark:hover:bg-blue-950/20 cursor-pointer transition-colors group"
                    >
                      <td className="py-3.5 px-4 font-mono font-bold text-primary group-hover:underline">
                        {c.id}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-gray-900 dark:text-white line-clamp-1">
                          {c.business.legalName}
                        </div>
                        <div className="text-[11px] text-gray-500 dark:text-gray-400">
                          {c.applicant.fullName} • {c.business.vintageYears}y vintage
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-gray-900 dark:text-white whitespace-nowrap">
                        {formatCurrency(c.loanRequest.amount)}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`font-mono font-medium ${c.financials.foir > 60 ? 'text-rose-600 dark:text-rose-400' : 'text-gray-700 dark:text-gray-300'}`}>
                          {c.financials.foir}%
                        </span>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <RiskBadge risk={c.riskLevel} />
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <StatusBadge status={c.status} />
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <Button
                          variant="ghost"
                          size="xs"
                          rightIcon={<ExternalLink className="w-3 h-3" />}
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/cases/${c.id}`);
                          }}
                        >
                          View
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {/* Pagination Controls */}
            <div className="p-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
              <span>
                Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, filteredCases.length)} of {filteredCases.length} cases
              </span>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="xs"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  leftIcon={<ChevronLeft className="w-3 h-3" />}
                >
                  Prev
                </Button>
                <span className="font-medium text-gray-900 dark:text-white px-2">
                  {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="xs"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  rightIcon={<ChevronRight className="w-3 h-3" />}
                >
                  Next
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity Timeline Panel */}
        <Card className="lg:col-span-4">
          <CardHeader>
            <div className="flex items-center justify-between w-full">
              <CardTitle>Autonomous Agent Activity</CardTitle>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative pl-5 border-l-2 border-gray-200 dark:border-gray-700 space-y-6">
              {recentActivities.map(act => (
                <div key={act.id} className="relative group">
                  <div
                    className={`absolute -left-[27px] top-0 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-gray-900 ${
                      act.type === 'alert'
                        ? 'bg-rose-500'
                        : act.type === 'success'
                        ? 'bg-emerald-500'
                        : 'bg-primary'
                    }`}
                  />
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-gray-900 dark:text-white leading-tight">
                        {act.title}
                      </span>
                      <span className="text-[10px] text-gray-400 whitespace-nowrap ml-2">
                        {act.time}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-300 mt-1 leading-relaxed">
                      {act.desc}
                    </p>
                    <button
                      onClick={() => navigate(`/cases/${act.caseId}`)}
                      className="mt-1.5 text-[11px] font-semibold text-primary hover:underline flex items-center gap-1"
                    >
                      Inspect #{act.caseId} →
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2">
              <Button
                variant="outline"
                size="sm"
                className="w-full text-xs"
                onClick={() => navigate('/cases/LL-9041/audit')}
              >
                View Full Audit Logs
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
