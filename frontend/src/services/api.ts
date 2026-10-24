import { 
  LoanCase, 
  Finding, 
  UploadedDocItem, 
  AuditStep, 
  EvidenceNode, 
  EvidenceEdge, 
  SimulatorInputs, 
  SimulatorOutputs, 
  CaseStatus,
  FindingCategory,
  SeverityType,
  RiskLevel,
  RecommendationType,
  DocumentType
} from '../types';
import { 
  mockLoanCases, 
  mockFindings, 
  mockUploadedDocs, 
  mockEvidenceNodes, 
  mockEvidenceEdges, 
  mockAuditTimeline, 
  currentUser 
} from './mockData';
import { calculateEmi } from '../utils/formatters';

// Local storage keys
const CASES_KEY = 'loanlens_cases';
const FINDINGS_KEY = 'loanlens_findings';
const DOCS_KEY = 'loanlens_docs';

// Helpers to load/persist to localStorage
function getStoredCases(): LoanCase[] {
  const data = localStorage.getItem(CASES_KEY);
  if (!data) {
    localStorage.setItem(CASES_KEY, JSON.stringify(mockLoanCases));
    return mockLoanCases;
  }
  try {
    return JSON.parse(data);
  } catch {
    return mockLoanCases;
  }
}

function getStoredFindings(): Finding[] {
  const data = localStorage.getItem(FINDINGS_KEY);
  if (!data) {
    localStorage.setItem(FINDINGS_KEY, JSON.stringify(mockFindings));
    return mockFindings;
  }
  try {
    return JSON.parse(data);
  } catch {
    return mockFindings;
  }
}

function getStoredDocs(): UploadedDocItem[] {
  const data = localStorage.getItem(DOCS_KEY);
  if (!data) {
    localStorage.setItem(DOCS_KEY, JSON.stringify(mockUploadedDocs));
    return mockUploadedDocs;
  }
  try {
    return JSON.parse(data);
  } catch {
    return mockUploadedDocs;
  }
}

// Simulated network delay
const delay = (ms: number = 300) => new Promise(res => setTimeout(res, ms));

export const api = {
  // Authentication
  async login(email: string, _password: string) {
    await delay(500);
    if (!email || !email.includes('@')) {
      throw new Error('Please enter a valid banking corporate email');
    }
    const token = 'jwt_loanlens_session_' + Math.random().toString(36).substring(2);
    localStorage.setItem('loanlens_auth_token', token);
    localStorage.setItem('loanlens_user', JSON.stringify({ ...currentUser, email }));
    return {
      token,
      user: { ...currentUser, email },
    };
  },

  async getCurrentUser() {
    await delay(150);
    const stored = localStorage.getItem('loanlens_user');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return currentUser;
      }
    }
    return currentUser;
  },

  async logout() {
    await delay(200);
    localStorage.removeItem('loanlens_auth_token');
  },

  // Cases
  async getCases(params?: {
    search?: string;
    status?: string;
    risk?: string;
  }): Promise<LoanCase[]> {
    await delay(250);
    let cases = getStoredCases();

    if (params?.search) {
      const q = params.search.toLowerCase();
      cases = cases.filter(c => 
        c.id.toLowerCase().includes(q) ||
        c.applicant.fullName.toLowerCase().includes(q) ||
        c.business.legalName.toLowerCase().includes(q) ||
        c.business.industry.toLowerCase().includes(q)
      );
    }

    if (params?.status && params.status !== 'All') {
      cases = cases.filter(c => c.status === params.status);
    }

    if (params?.risk && params.risk !== 'All') {
      cases = cases.filter(c => c.riskLevel === params.risk);
    }

    return cases;
  },

  async getCaseById(id: string): Promise<LoanCase | null> {
    await delay(200);
    const cases = getStoredCases();
    return cases.find(c => c.id.toLowerCase() === id.toLowerCase()) || null;
  },

  async createCase(data: Partial<LoanCase>): Promise<LoanCase> {
    await delay(600);
    const cases = getStoredCases();
    const newId = `LL-${Math.floor(9000 + Math.random() * 900)}`;

    const newCase: LoanCase = {
      id: newId,
      applicant: data.applicant || {
        fullName: 'New Applicant',
        email: 'applicant@example.com',
        phone: '+91 98000 00000',
        pan: 'ABCDE1234F',
        aadhaar: 'XXXX-XXXX-0000',
        address: 'Mumbai, Maharashtra',
        cibilScore: 750,
        experienceYears: 5,
      },
      business: data.business || {
        legalName: 'New Business Enterprises',
        tradeName: 'New Business',
        businessType: 'Private Limited',
        gstin: '27AABCA0000F1Z0',
        industry: 'Manufacturing',
        vintageYears: 5,
        registeredAddress: 'Mumbai, Maharashtra',
        annualTurnover: 25000000,
        employeeCount: 20,
      },
      loanRequest: data.loanRequest || {
        amount: 5000000,
        tenureMonths: 36,
        purpose: 'Working Capital Expansion',
        interestRateExpected: 11.5,
        collateralOffered: 'Commercial Property Hypothecation',
        collateralValue: 8000000,
      },
      financials: data.financials || {
        monthlyTurnover: 2083333,
        monthlyExpenses: 1550000,
        netOperatingIncome: 533333,
        existingEmiObligations: 65000,
        foir: 38.2,
        dscr: 1.75,
        currentRatio: 1.4,
        bankBalanceAvg: 620000,
        bouncesLast6Months: 0,
        gstTurnoverMismatchPct: 1.8,
      },
      policyChecks: [
        { id: 'p1', ruleName: 'Minimum Business Vintage', description: 'Business operational >= 3 years', status: 'passed', value: `${data.business?.vintageYears || 5} Years`, threshold: '>= 3 Years', impact: 'Qualified' },
        { id: 'p2', ruleName: 'FOIR Ceiling Check', description: 'Total debt obligations < 55%', status: 'passed', value: '38.2%', threshold: '<= 55.0%', impact: 'Healthy capacity' },
        { id: 'p3', ruleName: 'Promoter CIBIL', description: 'Bureau score >= 700', status: 'passed', value: `${data.applicant?.cibilScore || 750}`, threshold: '>= 700', impact: 'Approved tier' },
        { id: 'p4', ruleName: 'Bank-GST Reconciliation', description: 'Variance < 10%', status: 'passed', value: '1.8%', threshold: '<= 10.0%', impact: 'High data reliability' },
      ],
      status: 'Under Investigation',
      riskLevel: 'Low',
      recommendation: 'Approve',
      aiConfidence: 94,
      assignedUnderwriter: currentUser.name,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      documentsCount: { uploaded: 5, required: 5 },
      keyFindingsCount: { critical: 0, high: 0, medium: 1, low: 2 },
    };

    const updated = [newCase, ...cases];
    localStorage.setItem(CASES_KEY, JSON.stringify(updated));
    return newCase;
  },

  async updateCaseStatus(id: string, status: CaseStatus, _notes?: string): Promise<LoanCase> {
    await delay(350);
    const cases = getStoredCases();
    const idx = cases.findIndex(c => c.id.toLowerCase() === id.toLowerCase());
    if (idx === -1) throw new Error('Case not found');

    cases[idx].status = status;
    cases[idx].updatedAt = new Date().toISOString();
    localStorage.setItem(CASES_KEY, JSON.stringify(cases));
    return cases[idx];
  },

  // Findings
  async getFindings(params?: {
    caseId?: string;
    category?: FindingCategory | 'All';
    severity?: SeverityType | 'All';
  }): Promise<Finding[]> {
    await delay(200);
    let findings = getStoredFindings();

    if (params?.caseId) {
      findings = findings.filter(f => f.caseId.toLowerCase() === params.caseId!.toLowerCase());
    }

    if (params?.category && params.category !== 'All') {
      findings = findings.filter(f => f.category === params.category);
    }

    if (params?.severity && params.severity !== 'All') {
      findings = findings.filter(f => f.severity === params.severity);
    }

    return findings;
  },

  // Documents
  async getDocuments(caseId: string): Promise<UploadedDocItem[]> {
    await delay(200);
    const docs = getStoredDocs();
    const matched = docs.filter(d => d.caseId.toLowerCase() === caseId.toLowerCase());
    return matched.length > 0 ? matched : docs; // fallback to mock docs for demo
  },

  async uploadDocument(caseId: string, type: DocumentType, file: File): Promise<UploadedDocItem> {
    await delay(400);
    const docs = getStoredDocs();
    const newDoc: UploadedDocItem = {
      id: `doc-${Date.now()}`,
      caseId,
      type,
      fileName: file.name,
      fileSize: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
      uploadedAt: new Date().toISOString(),
      status: 'completed',
      progress: 100,
      extractedHighlights: ['Processed via OCR Engine', 'Checksum verified SHA-256', 'Ready for agent analysis'],
      pageCount: Math.floor(Math.random() * 15) + 2,
      verifiedByAi: true,
    };
    const updated = [newDoc, ...docs];
    localStorage.setItem(DOCS_KEY, JSON.stringify(updated));
    return newDoc;
  },

  // Evidence Graph
  async getEvidenceGraph(_caseId: string): Promise<{ nodes: EvidenceNode[]; edges: EvidenceEdge[] }> {
    await delay(200);
    return {
      nodes: mockEvidenceNodes,
      edges: mockEvidenceEdges,
    };
  },

  // Audit Timeline
  async getAuditTimeline(caseId: string): Promise<AuditStep[]> {
    await delay(200);
    return mockAuditTimeline.map(step => ({ ...step, caseId }));
  },

  // What-if Simulation Engine
  runSimulation(inputs: SimulatorInputs): SimulatorOutputs {
    const { 
      monthlyIncome, 
      monthlyExpense, 
      requestedLoan, 
      loanTenureMonths, 
      annualInterestRate, 
      existingEmi 
    } = inputs;

    const monthlyEmi = calculateEmi(requestedLoan, annualInterestRate, loanTenureMonths);
    const totalRepayment = monthlyEmi * loanTenureMonths;
    const totalInterest = Math.max(0, totalRepayment - requestedLoan);

    const totalMonthlyObligations = existingEmi + monthlyEmi;
    const foir = monthlyIncome > 0 ? Number(((totalMonthlyObligations / monthlyIncome) * 100).toFixed(1)) : 100;
    const freeCashFlow = monthlyIncome - monthlyExpense - totalMonthlyObligations;
    
    // DSCR = (Net Operating Income) / (Annual Debt Service / 12)
    const noi = monthlyIncome - monthlyExpense;
    const dscr = totalMonthlyObligations > 0 ? Number((noi / totalMonthlyObligations).toFixed(2)) : 5.0;

    // Risk Categorization
    let riskCategory: RiskLevel = 'Low';
    let policyResult: 'Eligible' | 'Borderline' | 'Ineligible' = 'Eligible';
    let recommendation: RecommendationType = 'Approve';
    const policyNotes: string[] = [];

    if (foir > 65 || dscr < 1.1 || freeCashFlow < 0) {
      riskCategory = 'Critical';
      policyResult = 'Ineligible';
      recommendation = 'Reject';
      policyNotes.push('High debt service burden: FOIR exceeds acceptable 60% threshold.');
      policyNotes.push('Negative or razor-thin cash buffer threatens loan repayment stability.');
    } else if (foir > 50 || dscr < 1.35) {
      riskCategory = 'High';
      policyResult = 'Borderline';
      recommendation = 'Manual Review';
      policyNotes.push('Elevated FOIR between 50% and 65%. Requires senior credit sanction.');
      policyNotes.push('Collateral cover or promoter guarantee recommended.');
    } else if (foir > 40 || dscr < 1.6) {
      riskCategory = 'Medium';
      policyResult = 'Eligible';
      recommendation = 'Conditional Approve';
      policyNotes.push('Acceptable debt ratios with moderate safety cushion.');
      policyNotes.push('Recommend 36-month tenure to optimize amortization.');
    } else {
      riskCategory = 'Low';
      policyResult = 'Eligible';
      recommendation = 'Strong Approve';
      policyNotes.push('Prime financial posture: Excellent free cash flow and healthy FOIR.');
      policyNotes.push('Eligible for preferential 25-50 bps interest concession.');
    }

    // Maximum affordable loan (assuming max 50% FOIR target)
    const maxAvailableEmi = Math.max(0, (monthlyIncome * 0.50) - existingEmi);
    const r = (annualInterestRate / 12) / 100;
    const n = loanTenureMonths;
    const maxAffordableLoan = r > 0 
      ? Math.round(maxAvailableEmi * (Math.pow(1 + r, n) - 1) / (r * Math.pow(1 + r, n)))
      : Math.round(maxAvailableEmi * n);

    return {
      monthlyEmi,
      totalRepayment,
      totalInterest,
      foir,
      freeCashFlow,
      dscr,
      riskCategory,
      policyResult,
      recommendation,
      maxAffordableLoan,
      policyNotes,
    };
  },
};
