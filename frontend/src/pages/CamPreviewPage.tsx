import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { 
  Printer, 
  Download, 
  CheckCircle2, 
  XCircle, 
  HelpCircle, 
  FileText, 
  ShieldCheck, 
  Building2, 
  Calendar, 
  Coins, 
  Sparkles,
  Award,
  Layers,
  ArrowLeft
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { StatusBadge, RiskBadge, RecommendationBadge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { Breadcrumb } from '../components/common/Breadcrumb';
import { CardSkeleton } from '../components/common/Skeleton';
import { useToast } from '../hooks/useToast';
import { api } from '../services/api';
import { LoanCase } from '../types';
import { formatCurrency, formatPercent, formatDate } from '../utils/formatters';

export const CamPreviewPage: React.FC = () => {
  const params = useParams();
  const navigate = useNavigate();
  const caseId = params.id || 'LL-9041';
  const { success, info, error } = useToast();

  const [loanCase, setLoanCase] = useState<LoanCase | null>(null);
  const [loading, setLoading] = useState(true);

  // Actions states
  const [confirmApproveOpen, setConfirmApproveOpen] = useState(false);
  const [confirmRejectOpen, setConfirmRejectOpen] = useState(false);
  const [infoModalOpen, setInfoModalOpen] = useState(false);
  const [infoQuery, setInfoQuery] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

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

  const handleApprove = async () => {
    if (!loanCase) return;
    setIsProcessing(true);
    try {
      await api.updateCaseStatus(loanCase.id, 'Approved');
      setLoanCase(prev => (prev ? { ...prev, status: 'Approved' } : null));

      // Trigger celebratory confetti
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });

      success('Credit Sanction Mandate Issued', `CAM #${loanCase.id} approved by Senior Underwriter.`);
      setConfirmApproveOpen(false);
    } catch (err: any) {
      error('Approval Failed', err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!loanCase) return;
    setIsProcessing(true);
    try {
      await api.updateCaseStatus(loanCase.id, 'Rejected');
      setLoanCase(prev => (prev ? { ...prev, status: 'Rejected' } : null));
      info('Application Rejected', `Adverse finding registered for Case ${loanCase.id}.`);
      setConfirmRejectOpen(false);
    } catch (err: any) {
      error('Rejection Failed', err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSendInfoRequest = () => {
    if (!infoQuery.trim()) {
      error('Missing Information', 'Please detail the required clarifications.');
      return;
    }
    info('Query Dispatched', `Clarification notice sent to ${loanCase?.applicant.email}.`);
    setInfoModalOpen(false);
    setInfoQuery('');
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return <CardSkeleton rows={8} />;
  }

  if (!loanCase) {
    return <div>Case not found</div>;
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Non-printable Navigation Bar */}
      <div className="no-print flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-gray-100 dark:border-gray-800">
        <Breadcrumb
          items={[
            { label: 'Cases' },
            { label: `Case ${caseId}`, href: `/cases/${caseId}` },
            { label: 'Credit Assessment Memorandum (CAM)' },
          ]}
        />

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrint}
            leftIcon={<Printer className="w-4 h-4" />}
          >
            Export PDF / Print
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setInfoModalOpen(true)}
            leftIcon={<HelpCircle className="w-4 h-4" />}
          >
            Request Info
          </Button>

          <Button
            variant="danger"
            size="sm"
            onClick={() => setConfirmRejectOpen(true)}
            disabled={loanCase.status === 'Rejected'}
          >
            Reject
          </Button>

          <Button
            variant="success"
            size="sm"
            onClick={() => setConfirmApproveOpen(true)}
            disabled={loanCase.status === 'Approved'}
            leftIcon={<CheckCircle2 className="w-4 h-4" />}
          >
            Approve
          </Button>
        </div>
      </div>

      {/* Formal Credit Assessment Memorandum Document */}
      <div className="bg-white text-gray-900 dark:bg-gray-900 dark:text-gray-100 p-8 sm:p-12 rounded-2xl shadow-soft-lg border border-gray-200 dark:border-gray-800 space-y-8">
        {/* Institutional Bank Header */}
        <div className="border-b-2 border-primary pb-6 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
          <div>
            <div className="flex items-center gap-2 text-primary font-bold text-lg">
              <Layers className="w-6 h-6" />
              <span>LoanLens AI Banking Underwriting Desk</span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 uppercase tracking-wider font-semibold">
              Commercial Credit & Risk Assessment Memorandum (CAM)
            </p>
          </div>

          <div className="text-right text-xs space-y-1">
            <div className="font-mono font-bold text-sm text-gray-900 dark:text-white">
              REF: CAM-2026-{loanCase.id}
            </div>
            <div className="text-gray-500">Date: {formatDate(loanCase.updatedAt)}</div>
            <div className="text-gray-500">Underwriter: {loanCase.assignedUnderwriter}</div>
          </div>
        </div>

        {/* Executive Summary Grid */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-primary border-b border-gray-100 dark:border-gray-800 pb-1">
            1. Executive Proposal & Facility Terms
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 text-xs">
            <div>
              <span className="text-gray-400 uppercase text-[10px] font-bold">Proposed Facility</span>
              <p className="font-bold text-base text-gray-900 dark:text-white mt-0.5">
                {formatCurrency(loanCase.loanRequest.amount)}
              </p>
            </div>
            <div>
              <span className="text-gray-400 uppercase text-[10px] font-bold">Tenure & Rate</span>
              <p className="font-bold text-gray-900 dark:text-white mt-0.5">
                {loanCase.loanRequest.tenureMonths} Mos @ {loanCase.loanRequest.interestRateExpected}% p.a.
              </p>
            </div>
            <div>
              <span className="text-gray-400 uppercase text-[10px] font-bold">Risk Classification</span>
              <div className="mt-1">
                <RiskBadge risk={loanCase.riskLevel} />
              </div>
            </div>
            <div>
              <span className="text-gray-400 uppercase text-[10px] font-bold">AI Verdict</span>
              <div className="mt-1">
                <RecommendationBadge recommendation={loanCase.recommendation} />
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Borrower & Promoter Profile */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-primary border-b border-gray-100 dark:border-gray-800 pb-1">
            2. Commercial Entity & Promoter Background
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
            <div className="space-y-2">
              <div className="flex justify-between py-1 border-b border-gray-100 dark:border-gray-800">
                <span className="text-gray-500">Legal Entity Name:</span>
                <span className="font-bold">{loanCase.business.legalName}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-100 dark:border-gray-800">
                <span className="text-gray-500">Constitution:</span>
                <span className="font-medium">{loanCase.business.businessType}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-100 dark:border-gray-800">
                <span className="text-gray-500">GSTIN:</span>
                <span className="font-mono font-bold text-primary">{loanCase.business.gstin}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-100 dark:border-gray-800">
                <span className="text-gray-500">Industry / Sector:</span>
                <span>{loanCase.business.industry}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-100 dark:border-gray-800">
                <span className="text-gray-500">Operating Vintage:</span>
                <span>{loanCase.business.vintageYears} Years Continuous Operation</span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between py-1 border-b border-gray-100 dark:border-gray-800">
                <span className="text-gray-500">Key Promoter:</span>
                <span className="font-bold">{loanCase.applicant.fullName}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-100 dark:border-gray-800">
                <span className="text-gray-500">Promoter PAN:</span>
                <span className="font-mono">{loanCase.applicant.pan}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-100 dark:border-gray-800">
                <span className="text-gray-500">CIBIL Bureau Score:</span>
                <span className="font-mono font-bold text-emerald-600">{loanCase.applicant.cibilScore}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-100 dark:border-gray-800">
                <span className="text-gray-500">Experience:</span>
                <span>{loanCase.applicant.experienceYears} Years in same sector</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-100 dark:border-gray-800">
                <span className="text-gray-500">Registered Office:</span>
                <span className="truncate max-w-[220px]">{loanCase.business.registeredAddress}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Financial Statement & Banking Analysis */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-primary border-b border-gray-100 dark:border-gray-800 pb-1">
            3. Financial Ratios & Cash Flow Synthesis
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div className="p-3 rounded-lg border border-gray-100 dark:border-gray-800">
              <span className="text-gray-400 uppercase text-[10px]">Annual Audited Turnover</span>
              <p className="font-bold text-sm text-gray-900 dark:text-white mt-1">
                {formatCurrency(loanCase.business.annualTurnover)}
              </p>
            </div>
            <div className="p-3 rounded-lg border border-gray-100 dark:border-gray-800">
              <span className="text-gray-400 uppercase text-[10px]">Debt Service Coverage (DSCR)</span>
              <p className="font-bold text-sm text-emerald-600 mt-1">
                {loanCase.financials.dscr}x
              </p>
            </div>
            <div className="p-3 rounded-lg border border-gray-100 dark:border-gray-800">
              <span className="text-gray-400 uppercase text-[10px]">Current FOIR</span>
              <p className="font-bold text-sm text-gray-900 dark:text-white mt-1">
                {loanCase.financials.foir}%
              </p>
            </div>
            <div className="p-3 rounded-lg border border-gray-100 dark:border-gray-800">
              <span className="text-gray-400 uppercase text-[10px]">Average Daily Bank Balance</span>
              <p className="font-bold text-sm text-gray-900 dark:text-white mt-1">
                {formatCurrency(loanCase.financials.bankBalanceAvg)}
              </p>
            </div>
          </div>
        </div>

        {/* Section 4: Key Findings & Fraud Checks */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-primary border-b border-gray-100 dark:border-gray-800 pb-1">
            4. Multi-Agent Audit & Integrity Findings
          </h3>

          <div className="space-y-2 text-xs">
            <div className="p-3 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40 flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-emerald-800 dark:text-emerald-300">
                  GST Turnover Integrity Validated:
                </span>{' '}
                <span className="text-gray-700 dark:text-gray-300">
                  Reconciliation between GSTR-1 and bank deposits yielded only a {loanCase.financials.gstTurnoverMismatchPct}% variance, well within the 10% statutory variance threshold.
                </span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40 flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-blue-800 dark:text-blue-300">
                  Anti-Fraud Circular Trade Clear:
                </span>{' '}
                <span className="text-gray-700 dark:text-gray-300">
                  Anti-Fraud Detective agent verified transaction graph across 18 related entities. Zero round-tripping or accommodation bill patterns discovered.
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Section 5: Sanction Conditions & Covenants */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-primary border-b border-gray-100 dark:border-gray-800 pb-1">
            5. Recommended Sanction Covenants
          </h3>

          <ul className="text-xs text-gray-700 dark:text-gray-300 space-y-1.5 list-disc pl-5 leading-relaxed">
            <li>Primary security: Hypothecation of all plant machinery and tooling equipment acquired out of bank financing.</li>
            <li>Collateral security: Exclusive equitable mortgage of industrial property (Valuation {formatCurrency(loanCase.loanRequest.collateralValue)}).</li>
            <li>Personal Guarantee: Unconditional personal guarantee of promoter {loanCase.applicant.fullName}.</li>
            <li>Routing Covenant: Minimum 85% of total sales realizations to route through lending bank current account.</li>
          </ul>
        </div>

        {/* Formal Underwriter Signatures */}
        <div className="pt-8 border-t border-gray-200 dark:border-gray-800 grid grid-cols-2 sm:grid-cols-3 gap-6 text-xs">
          <div>
            <span className="text-gray-400 uppercase text-[10px] font-bold block mb-6">
              Assessing Underwriter
            </span>
            <div className="font-bold">{loanCase.assignedUnderwriter}</div>
            <div className="text-[11px] text-gray-500">Commercial Credit Analyst</div>
          </div>

          <div>
            <span className="text-gray-400 uppercase text-[10px] font-bold block mb-6">
              Credit Risk Officer
            </span>
            <div className="font-bold">Anil Khurana, VP Risk</div>
            <div className="text-[11px] text-gray-500">Sanction Committee Member</div>
          </div>

          <div>
            <span className="text-gray-400 uppercase text-[10px] font-bold block mb-6">
              Cryptographic Digital Seal
            </span>
            <div className="font-mono text-[10px] text-emerald-600">
              SHA256: 0x99a4bc109f...
            </div>
            <div className="text-[10px] text-gray-400">Verifiable PKI Timestamp</div>
          </div>
        </div>
      </div>

      {/* Confirmation Modals */}
      <ConfirmDialog
        isOpen={confirmApproveOpen}
        onClose={() => setConfirmApproveOpen(false)}
        onConfirm={handleApprove}
        type="success"
        title="Sanction Credit Facility?"
        message={`Confirming will issue final sanction order for ₹${(loanCase.loanRequest.amount / 100000).toFixed(1)} Lakhs to ${loanCase.business.legalName}.`}
        confirmLabel="Issue Sanction Mandate"
        isLoading={isProcessing}
      />

      <ConfirmDialog
        isOpen={confirmRejectOpen}
        onClose={() => setConfirmRejectOpen(false)}
        onConfirm={handleReject}
        type="danger"
        title="Reject Application?"
        message={`Are you sure you want to decline this credit proposal?`}
        confirmLabel="Confirm Rejection"
        isLoading={isProcessing}
      />

      {/* Request Information Modal */}
      <Modal
        isOpen={infoModalOpen}
        onClose={() => setInfoModalOpen(false)}
        title="Request Additional Borrower Information"
        description="Specify documents or clarifications needed from borrower or field branch."
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setInfoModalOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleSendInfoRequest}>
              Send Information Request
            </Button>
          </>
        }
      >
        <div className="space-y-3 py-2 text-xs">
          <label className="font-semibold text-gray-700 dark:text-gray-300">
            Query Details:
          </label>
          <textarea
            rows={4}
            value={infoQuery}
            onChange={e => setInfoQuery(e.target.value)}
            placeholder="e.g. Please provide GST challan receipts for March 2024 to verify quarterly settlement discrepancy..."
            className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-3 text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      </Modal>
    </div>
  );
};
