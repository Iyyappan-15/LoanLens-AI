export type RiskLevel = 'Low' | 'Medium' | 'High' | 'Critical';

export type CaseStatus = 
  | 'Pending Review' 
  | 'Under Investigation' 
  | 'Approved' 
  | 'Rejected' 
  | 'Information Requested' 
  | 'Draft';

export type RecommendationType = 
  | 'Strong Approve'
  | 'Approve' 
  | 'Conditional Approve' 
  | 'Manual Review' 
  | 'Reject';

export type BusinessType = 
  | 'Private Limited' 
  | 'Proprietorship' 
  | 'Partnership' 
  | 'LLP' 
  | 'Public Limited';

export interface ApplicantInfo {
  fullName: string;
  email: string;
  phone: string;
  pan: string;
  aadhaar: string;
  address: string;
  cibilScore: number;
  experienceYears: number;
}

export interface BusinessInfo {
  legalName: string;
  tradeName: string;
  businessType: BusinessType;
  gstin: string;
  industry: string;
  vintageYears: number;
  registeredAddress: string;
  annualTurnover: number;
  employeeCount: number;
}

export interface LoanRequestInfo {
  amount: number;
  tenureMonths: number;
  purpose: string;
  interestRateExpected: number;
  collateralOffered: string;
  collateralValue: number;
}

export interface FinancialSummary {
  monthlyTurnover: number;
  monthlyExpenses: number;
  netOperatingIncome: number;
  existingEmiObligations: number;
  foir: number; // % e.g., 42.5
  dscr: number; // Debt Service Coverage Ratio
  currentRatio: number;
  bankBalanceAvg: number;
  bouncesLast6Months: number;
  gstTurnoverMismatchPct: number;
}

export interface PolicyCheck {
  id: string;
  ruleName: string;
  description: string;
  status: 'passed' | 'warning' | 'failed';
  value: string;
  threshold: string;
  impact: string;
}

export interface LoanCase {
  id: string;
  applicant: ApplicantInfo;
  business: BusinessInfo;
  loanRequest: LoanRequestInfo;
  financials: FinancialSummary;
  policyChecks: PolicyCheck[];
  status: CaseStatus;
  riskLevel: RiskLevel;
  recommendation: RecommendationType;
  aiConfidence: number; // 0-100
  assignedUnderwriter: string;
  createdAt: string;
  updatedAt: string;
  documentsCount: {
    uploaded: number;
    required: number;
  };
  keyFindingsCount: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
}

export type FindingCategory = 
  | 'Fraud Alerts' 
  | 'Cash Flow Analysis' 
  | 'GST Reconciliation' 
  | 'Missing Documents' 
  | 'Duplicate Transactions';

export type SeverityType = 'Critical' | 'High' | 'Medium' | 'Low';

export interface Finding {
  id: string;
  caseId: string;
  category: FindingCategory;
  title: string;
  description: string;
  severity: SeverityType;
  evidenceLink: string;
  evidenceSnippet?: string;
  confidenceScore: number; // 0-100
  detectedAt: string;
  agentSource: string;
  status: 'Active' | 'Investigating' | 'Resolved' | 'Overridden';
}

export type DocumentType = 
  | 'Bank Statement' 
  | 'GST Report' 
  | 'Income Tax Return' 
  | 'KYC' 
  | 'Financial Statement';

export interface UploadedDocItem {
  id: string;
  caseId: string;
  type: DocumentType;
  fileName: string;
  fileSize: string;
  uploadedAt: string;
  status: 'completed' | 'uploading' | 'validating' | 'error';
  progress: number;
  errorMessage?: string;
  fileUrl?: string;
  extractedHighlights?: string[];
  pageCount?: number;
  verifiedByAi?: boolean;
}

export interface AuditStep {
  id: string;
  caseId: string;
  stepName: 
    | 'Document Uploaded'
    | 'Cash Flow Calculated'
    | 'GST Reconciled'
    | 'Fraud Investigation'
    | 'Policy Agent Evaluated'
    | 'CAM Generated'
    | 'Human Decision';
  agent: string;
  status: 'completed' | 'in_progress' | 'flagged' | 'pending';
  timestamp: string;
  durationMs: number;
  hash: string;
  details: string;
  metadata?: Record<string, string | number>;
  verifiedSignature: string;
}

export interface EvidenceNode {
  id: string;
  label: string;
  subtitle?: string;
  type: 'doc' | 'extraction' | 'agent' | 'report' | 'human';
  status: 'passed' | 'warning' | 'alert' | 'pending';
  confidence: number;
  x: number;
  y: number;
  iconName?: string;
  details: {
    source: string;
    verifiedAt: string;
    metrics: { label: string; value: string }[];
    notes: string;
  };
}

export interface EvidenceEdge {
  id: string;
  from: string;
  to: string;
  label?: string;
  animated?: boolean;
  alert?: boolean;
}

export interface SimulatorInputs {
  monthlyIncome: number;
  monthlyExpense: number;
  requestedLoan: number;
  loanTenureMonths: number;
  annualInterestRate: number;
  existingEmi: number;
}

export interface SimulatorOutputs {
  monthlyEmi: number;
  totalRepayment: number;
  totalInterest: number;
  foir: number;
  freeCashFlow: number;
  dscr: number;
  riskCategory: RiskLevel;
  policyResult: 'Eligible' | 'Borderline' | 'Ineligible';
  recommendation: RecommendationType;
  maxAffordableLoan: number;
  policyNotes: string[];
}

export interface UserNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'alert';
  timestamp: string;
  read: boolean;
  caseId?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: 'Senior Underwriter' | 'Credit Risk Officer' | 'Branch Manager' | 'System Admin';
  avatarUrl: string;
  department: string;
}
