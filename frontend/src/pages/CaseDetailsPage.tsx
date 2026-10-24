import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Building2, 
  User, 
  Coins, 
  TrendingUp, 
  ShieldCheck, 
  FileText, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  SlidersHorizontal, 
  GitFork, 
  History, 
  FileCheck2,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Sparkles,
  ExternalLink,
  Ban,
  ArrowUpRight,
  Info
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { StatusBadge, RiskBadge, RecommendationBadge } from '../components/common/Badge';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { Breadcrumb } from '../components/common/Breadcrumb';
import { CardSkeleton } from '../components/common/Skeleton';
import { useToast } from '../hooks/useToast';
import { api } from '../services/api';
import { LoanCase, CaseStatus } from '../types';
import { formatCurrency, formatPercent, formatDate } from '../utils/formatters';

export const CaseDetailsPage: React.FC = () => {
  const params = useParams();
  const navigate = useNavigate();
  const caseId = params.id || 'LL-9041';
  const { success, error } = useToast();

  const [loanCase, setLoanCase] = useState<LoanCase | null>(null);
  const [loading, setLoading] = useState(true);

  // Dialog states
  const [confirmApproveOpen, setConfirmApproveOpen] = useState(false);
  const [confirmRejectOpen, setConfirmRejectOpen] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  useEffect(() => {
    loadCase();
  }, [caseId]);

  const loadCase = async () => {
    setLoading(true);
    try {
      const data = await api.getCaseById(caseId);
      setLoanCase(data);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus: CaseStatus) => {
    if (!loanCase) return;
    setIsUpdatingStatus(true);
    try {
      const updated = await api.updateCaseStatus(loanCase.id, newStatus);
      setLoanCase(updated);
      success('Case Status Updated', `Case ${loanCase.id} is now ${newStatus}.`);
      setConfirmApproveOpen(false);
      setConfirmRejectOpen(false);
    } catch (err: any) {
      error('Update Failed', err.message);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <CardSkeleton rows={2} />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <CardSkeleton rows={4} />
          <CardSkeleton rows={4} />
          <CardSkeleton rows={4} />
        </div>
      </div>
    );
  }

  if (!loanCase) {
    return (
      <div className="p-12 text-center">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white">Case Not Found</h2>
        <Button className="mt-4" onClick={() => navigate('/')}>Return to Dashboard</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <Breadcrumb
        items={[
          { label: 'Cases' },
          { label: `${loanCase.id} — ${loanCase.business.legalName}` },
        ]}
      />

      {/* Case Header Hero Card */}
      <Card className="bg-gradient-to-r from-white via-white to-blue-50/40 dark:from-gray-900 dark:via-gray-900 dark:to-blue-950/20 border-l-4 border-l-primary">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            {/* Left Info */}
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-3">
                <span className="font-mono text-lg font-extrabold text-primary">
                  {loanCase.id}
                </span>
                <StatusBadge status={loanCase.status} />
                <RiskBadge risk={loanCase.riskLevel} />
                <RecommendationBadge recommendation={loanCase.recommendation} />
              </div>

              <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                {loanCase.business.legalName}
              </h1>

              <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-gray-500 dark:text-gray-400">
                <span className="flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-gray-400" /> Promoter: {loanCase.applicant.fullName}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5 text-gray-400" /> {loanCase.business.industry}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-gray-400" /> Ingested: {formatDate(loanCase.createdAt)}
                </span>
              </div>
            </div>

            {/* Right: Key Financial Ask & AI Confidence */}
            <div className="flex flex-wrap sm:flex-nowrap items-center gap-4 bg-white dark:bg-gray-800/80 p-4 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm">
              <div className="pr-4 border-r border-gray-100 dark:border-gray-700">
                <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">
                  Facility Requested
                </span>
                <div className="text-xl font-bold text-gray-900 dark:text-white">
                  {formatCurrency(loanCase.loanRequest.amount)}
                </div>
                <div className="text-[11px] text-gray-500">
                  {loanCase.loanRequest.tenureMonths} Months @ {loanCase.loanRequest.interestRateExpected}%
                </div>
              </div>

              <div>
                <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">
                  AI Model Confidence
                </span>
                <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-emerald-500" />
                  {loanCase.aiConfidence}%
                </div>
                <div className="text-[11px] text-emerald-600 font-medium">
                  Autonomous Verification
                </div>
              </div>
            </div>
          </div>

          {/* Quick Action Bar */}
          <div className="mt-6 pt-5 border-t border-gray-100 dark:border-gray-800 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => navigate(`/cases/${loanCase.id}/cam`)}
                leftIcon={<FileText className="w-4 h-4" />}
              >
                Open CAM Preview
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => navigate(`/cases/${loanCase.id}/findings`)}
                leftIcon={<AlertTriangle className="w-4 h-4" />}
              >
                Findings ({loanCase.keyFindingsCount.critical + loanCase.keyFindingsCount.high + loanCase.keyFindingsCount.medium})
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => navigate(`/cases/${loanCase.id}/evidence`)}
                leftIcon={<GitFork className="w-4 h-4" />}
              >
                Evidence Graph
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => navigate(`/cases/${loanCase.id}/documents`)}
                leftIcon={<FileCheck2 className="w-4 h-4" />}
              >
                Dossier Files ({loanCase.documentsCount.uploaded}/{loanCase.documentsCount.required})
              </Button>
            </div>

            {/* Underwriter Action Buttons */}
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="danger"
                onClick={() => setConfirmRejectOpen(true)}
                leftIcon={<Ban className="w-4 h-4" />}
              >
                Reject Case
              </Button>
              <Button
                size="sm"
                variant="success"
                onClick={() => setConfirmApproveOpen(true)}
                leftIcon={<CheckCircle2 className="w-4 h-4" />}
              >
                Approve Loan
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Grid of Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Col (8 cols): Financial Summary, Credit Indicators, Policy Checks */}
        <div className="lg:col-span-8 space-y-6">
          {/* Financial Metrics Summary */}
          <Card>
            <CardHeader>
              <div>
                <CardTitle>Cash Flow & Financial Summary</CardTitle>
                <CardDescription>
                  Synthesized from 12-month bank statements & audited filings
                </CardDescription>
              </div>
              <span className="text-xs font-semibold text-primary flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5" /> High Integrity
              </span>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800">
                  <span className="text-[10px] text-gray-400 uppercase font-bold">Monthly Turnover</span>
                  <p className="text-base font-bold text-gray-900 dark:text-white mt-1">
                    {formatCurrency(loanCase.financials.monthlyTurnover)}
                  </p>
                  <span className="text-[10px] text-gray-500">Rolling 12-month avg</span>
                </div>

                <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800">
                  <span className="text-[10px] text-gray-400 uppercase font-bold">Net Operating Income</span>
                  <p className="text-base font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                    {formatCurrency(loanCase.financials.netOperatingIncome)}
                  </p>
                  <span className="text-[10px] text-gray-500">Monthly surplus cash</span>
                </div>

                <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800">
                  <span className="text-[10px] text-gray-400 uppercase font-bold">FOIR (Debt / Income)</span>
                  <p className="text-base font-bold text-gray-900 dark:text-white mt-1">
                    {loanCase.financials.foir}%
                  </p>
                  <span className="text-[10px] text-emerald-600 font-medium">Cap: &lt; 55%</span>
                </div>

                <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800">
                  <span className="text-[10px] text-gray-400 uppercase font-bold">DSCR Coverage</span>
                  <p className="text-base font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                    {loanCase.financials.dscr}x
                  </p>
                  <span className="text-[10px] text-gray-500">Benchmark: &gt; 1.25x</span>
                </div>

                <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800">
                  <span className="text-[10px] text-gray-400 uppercase font-bold">Avg Bank Balance</span>
                  <p className="text-base font-bold text-gray-900 dark:text-white mt-1">
                    {formatCurrency(loanCase.financials.bankBalanceAvg)}
                  </p>
                  <span className="text-[10px] text-gray-500">365-day daily mean</span>
                </div>

                <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800">
                  <span className="text-[10px] text-gray-400 uppercase font-bold">Bounces (6 Mo)</span>
                  <p className="text-base font-bold text-gray-900 dark:text-white mt-1">
                    {loanCase.financials.bouncesLast6Months} Inward
                  </p>
                  <span className="text-[10px] text-emerald-600 font-medium">Clean Banking</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Underwriting Policy Engine Checks */}
          <Card>
            <CardHeader>
              <div>
                <CardTitle>Autonomous Policy Checks</CardTitle>
                <CardDescription>
                  Evaluated automatically against Bank MSME Credit Rules Matrix 2026
                </CardDescription>
              </div>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 font-semibold">
                {loanCase.policyChecks.filter(p => p.status === 'passed').length} / {loanCase.policyChecks.length} Passed
              </span>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-gray-100 dark:divide-gray-800 text-xs">
                {loanCase.policyChecks.map(check => {
                  let StatusIcon = CheckCircle2;
                  let iconColor = 'text-emerald-500';
                  let statusBg = 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300';

                  if (check.status === 'warning') {
                    StatusIcon = AlertTriangle;
                    iconColor = 'text-amber-500';
                    statusBg = 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300';
                  } else if (check.status === 'failed') {
                    StatusIcon = XCircle;
                    iconColor = 'text-rose-500';
                    statusBg = 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300';
                  }

                  return (
                    <div key={check.id} className="p-4 flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <StatusIcon className={`w-4 h-4 flex-shrink-0 mt-0.5 ${iconColor}`} />
                        <div>
                          <div className="font-semibold text-gray-900 dark:text-white">
                            {check.ruleName}
                          </div>
                          <div className="text-gray-500 dark:text-gray-400 mt-0.5">
                            {check.description}
                          </div>
                          <div className="mt-1 text-[11px] text-gray-400 font-medium">
                            Impact: {check.impact}
                          </div>
                        </div>
                      </div>

                      <div className="text-right flex-shrink-0">
                        <span className={`px-2 py-0.5 rounded-full font-semibold text-[11px] ${statusBg}`}>
                          {check.value}
                        </span>
                        <div className="text-[10px] text-gray-400 mt-1">
                          Rule: {check.threshold}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Col (4 cols): Applicant Profile & Business Background */}
        <div className="lg:col-span-4 space-y-6">
          {/* Promoter Profile */}
          <Card>
            <CardHeader>
              <CardTitle>Promoter & KYC Profile</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3.5 text-xs">
              <div className="flex items-center gap-3 pb-3 border-b border-gray-100 dark:border-gray-800">
                <div className="w-10 h-10 rounded-full bg-blue-100 text-primary dark:bg-blue-900/40 flex items-center justify-center font-bold text-sm">
                  {loanCase.applicant.fullName.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="font-bold text-sm text-gray-900 dark:text-white">
                    {loanCase.applicant.fullName}
                  </div>
                  <div className="text-[11px] text-gray-500">
                    Promoter • {loanCase.applicant.experienceYears} Years Industry Experience
                  </div>
                </div>
              </div>

              <div className="space-y-2 text-gray-600 dark:text-gray-300">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Promoter PAN:</span>
                  <span className="font-mono font-semibold text-gray-900 dark:text-white">
                    {loanCase.applicant.pan}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">CIBIL Bureau Score:</span>
                  <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                    {loanCase.applicant.cibilScore}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Phone:</span>
                  <span className="font-mono">{loanCase.applicant.phone}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Email:</span>
                  <span className="truncate max-w-[170px]">{loanCase.applicant.email}</span>
                </div>
                <div className="pt-2 border-t border-gray-100 dark:border-gray-800 text-[11px] text-gray-500">
                  <MapPin className="w-3.5 h-3.5 inline mr-1 text-gray-400" />
                  {loanCase.applicant.address}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Business Entity Background */}
          <Card>
            <CardHeader>
              <CardTitle>Commercial Entity Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2.5 text-xs text-gray-600 dark:text-gray-300">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Constitution:</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {loanCase.business.businessType}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">GSTIN:</span>
                <span className="font-mono font-semibold text-primary">
                  {loanCase.business.gstin}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Operating Vintage:</span>
                <span className="font-semibold">{loanCase.business.vintageYears} Years</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Annual Turnover:</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {formatCurrency(loanCase.business.annualTurnover)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Workforce:</span>
                <span>{loanCase.business.employeeCount} On Payroll</span>
              </div>
              <div className="pt-2 border-t border-gray-100 dark:border-gray-800 text-[11px] text-gray-500">
                <Building2 className="w-3.5 h-3.5 inline mr-1 text-gray-400" />
                {loanCase.business.registeredAddress}
              </div>
            </CardContent>
          </Card>

          {/* Collateral & Security Package */}
          <Card>
            <CardHeader>
              <CardTitle>Collateral & Security</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs">
              <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800">
                <span className="text-[10px] text-gray-400 uppercase font-bold">Hypothecation / Mortgage</span>
                <div className="font-semibold text-gray-900 dark:text-white mt-1">
                  {loanCase.loanRequest.collateralOffered}
                </div>
              </div>
              <div className="flex items-center justify-between pt-1">
                <span className="text-gray-400">Valuation:</span>
                <span className="font-bold text-gray-900 dark:text-white">
                  {formatCurrency(loanCase.loanRequest.collateralValue)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Loan to Value (LTV):</span>
                <span className="font-mono font-bold text-emerald-600">
                  {((loanCase.loanRequest.amount / loanCase.loanRequest.collateralValue) * 100).toFixed(1)}% (Healthy)
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Approve Confirmation Dialog */}
      <ConfirmDialog
        isOpen={confirmApproveOpen}
        onClose={() => setConfirmApproveOpen(false)}
        onConfirm={() => handleStatusChange('Approved')}
        type="success"
        title={`Sanction Loan ${loanCase.id}?`}
        message={`This will approve ${formatCurrency(loanCase.loanRequest.amount)} for ${loanCase.business.legalName} at ${loanCase.loanRequest.interestRateExpected}% p.a. for ${loanCase.loanRequest.tenureMonths} months.`}
        confirmLabel="Issue Sanction Mandate"
        isLoading={isUpdatingStatus}
      />

      {/* Reject Confirmation Dialog */}
      <ConfirmDialog
        isOpen={confirmRejectOpen}
        onClose={() => setConfirmRejectOpen(false)}
        onConfirm={() => handleStatusChange('Rejected')}
        type="danger"
        title={`Reject Loan Case ${loanCase.id}?`}
        message={`Are you sure you want to reject the application for ${loanCase.business.legalName}? An adverse underwriting memorandum will be recorded in the audit trail.`}
        confirmLabel="Confirm Rejection"
        isLoading={isUpdatingStatus}
      />
    </div>
  );
};
