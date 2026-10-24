# LoanLens AI — Enterprise MSME Loan Underwriting System

An enterprise-grade, modern React + TypeScript frontend for an AI-powered MSME Loan Underwriting System designed with a premium fintech aesthetic (inspired by Stripe, Ramp, Brex, Mercury, and Linear).

---

## 🎨 Fintech Design System

- **Clean Banking UI**: Minimalist, elevated, dense data density with soft shadows (`shadow-soft`, `shadow-soft-md`, `shadow-soft-lg`).
- **Rounded Geometry**: Precision 12px corners (`rounded-xl` / `rounded-card`).
- **Modern Typography**: Inter variable font paired with JetBrains Mono for financial figures, GSTINs, and PAN references.
- **Color Palette**:
  - **Primary Blue**: `#1E88E5` (Fintech Trust, Active States, Charts)
  - **Accent Orange**: `#FF3D00` (Highlights, Critical Metrics)
  - **Success Green**: `#2E7D32` (Approved, Passing Policies, Surplus)
  - **Alert Red**: `#E53935` (High Risk, Fraud Alerts, Ineligibility)
  - **Canvas Background**: `#F5F7FA` (Light) & `#0B0F19` (Dark Mode)
  - **Card Surface**: `#FFFFFF` (Light) & `#111827` / `#1F2937` (Dark Mode)
  - **Dark Text**: `#1A1A1A`

---

## 🚀 Application Architecture & Pages

### 1. Login Page (`/login`)
- Professional authentication screen with glassmorphic backdrop.
- Banking credentials input, "Remember device" checkbox, and interactive "Forgot Password" modal.
- Institutional trust metrics and feature highlights.
- **1-Click Demo Login** button prefilling Senior Underwriter session (`v.roy@mercurylending.ai`).

### 2. Dashboard (`/`)
- **4 Key Statistic Cards**: Total Cases (with +14.2% MoM growth), Pending Reviews (action required), Approved Volume (₹ Cr sanctioned), High/Critical Risk cases.
- **Interactive Risk Distribution Chart**: Recharts Bar chart visualizing credit risk grading across the portfolio.
- **Pipeline Status Pie Chart**: Recharts Donut chart visualizing case breakdown across approval stages.
- **Recent Applications Table**: Comprehensive table with instant search, status filter, risk tier filter, column sorting, and pagination.
- **Autonomous Activity Stream**: Live feed of agent clearances, fraud discoveries, and OCR extractions.

### 3. New Loan Case (`/cases/new`)
- Multi-step application form powered by **React Hook Form**:
  - **Step 1: Applicant Details** (Promoter KYC, PAN, Aadhaar, CIBIL bureau score, Industry experience).
  - **Step 2: Business Details** (Legal name, Trade name, Constitution, GSTIN, Operating vintage, Annual turnover, Workforce).
  - **Step 3: Requested Loan & Financing** (Requested facility, Tenure, Purpose, Collateral description & valuation).
- Interactive stepper bar with progress tracking and step switching.
- "Save Draft" caching to localStorage.
- Generates realistic case ID and redirects directly into document ingestion.

### 4. Document Upload Page (`/cases/:id/documents`)
- 5 Commercial Dossier Cards:
  1. **Bank Statement** (12-month current account)
  2. **GST Report** (GSTR-3B & GSTR-1 filings)
  3. **Income Tax Return** (ITR-5/6 with computation)
  4. **KYC** (Promoter PAN, Aadhaar, MOA/AOA)
  5. **Financial Statement** (Audited Balance Sheet & P&L)
- Drag & Drop zone with active hover states.
- Simulated real-time progressive OCR ingestion with progress bars.
- Document validation alerts and test warning triggers.
- **File Preview Drawer**: Displays parsed OCR highlights, page counts, and SHA-256 integrity hashes.

### 5. Case Details Page (`/cases/:id`)
- **Underwriting Hero Card**: Key facility request, risk level, autonomous model confidence (e.g. 96%), and recommendation badges.
- **Cash Flow & Financial Summary**: Monthly turnover, net operating income, FOIR debt obligation, DSCR coverage, and average bank balance.
- **Autonomous Policy Checks**: Evaluated against Bank MSME Credit Matrix 2026 (Pass/Warning/Fail indicators).
- **Promoter & KYC Profile**: Bureau scores, experience, contact details.
- **Collateral & Security Package**: Hypothecation specifics, valuation, and LTV calculation.
- **Action Bar**: Instant 1-click Approve or Reject with custom confirmation dialogs.

### 6. Findings Dashboard (`/cases/:id/findings`)
- Dedicated cards for:
  - **Fraud Alerts** (e.g., circular trading, round-tripping fund transfers).
  - **Cash Flow Analysis** (customer concentration, overdraft buffers).
  - **GST Reconciliation** (GSTR-1 vs bank deposit variance).
  - **Missing Documents** (missing depreciation schedules).
  - **Duplicate Transactions** (multi-bank invoice drawdown detection).
- Filtering tabs by category and severity (Critical, High, Medium, Low).
- Confidence score gauges for each agent signal.
- Underwriter action to mark findings as reviewed or resolved.

### 7. Evidence Graph (`/cases/:id/evidence`)
- Interactive multi-agent lineage flow:
  `Documents -> Extracted Data -> [Cash Flow, GST Reconciliation, Fraud Agents] -> Policy Agent -> CAM Generator -> Human Review`
- Pan & Zoom canvas (+, -, reset, and mouse drag navigation).
- Animated SVG connector pulses depicting active data flow.
- **Inspectable Node Drawer**: Clicking any node displays agent source, execution timestamps, detailed metrics, audit notes, and verifiable cryptographic signatures.

### 8. What-if Simulator (`/simulator`)
- Interactive credit capacity playground.
- Smooth sliders for:
  - Monthly Business Turnover
  - Monthly Expenses
  - Requested Loan Quantum
  - Loan Tenure (12 to 60 Months)
  - Interest Rate (% p.a.)
  - Existing Debt Obligations
- **Instant Output Calculations**:
  - FOIR gauge with threshold indicators
  - Proposed Monthly EMI
  - Net Free Cash Flow
  - DSCR coverage ratio
  - Maximum Recommended Loan capacity
  - Dynamic policy recommendation (Strong Approve, Conditional, Reject)
  - Principal vs Interest Repayment Pie Chart

### 9. CAM Preview (`/cases/:id/cam`)
- Professional banking report format: **Credit Assessment Memorandum (CAM)**.
- Formatted with `@media print` rules for clean single-click **Export to PDF / Print**.
- Structured institutional sections:
  1. Executive Proposal & Facility Terms
  2. Commercial Entity & Promoter Background
  3. Financial Statement Ratios & Cash Flow Synthesis
  4. Multi-Agent Audit & Integrity Findings
  5. Recommended Sanction Covenants & Digital Signatures
- **Approve Action**: Celebratory confetti trigger + status update.
- **Reject Action**: Adverse memorandum logging.
- **Request Info Action**: Clarification dispatch modal.

### 10. Audit Timeline (`/cases/:id/audit`)
- Complete verifiable step-by-step chronology:
  `Document Uploaded -> Cash Flow Calculated -> GST Reconciled -> Fraud Investigation -> Policy Evaluated -> CAM Generated -> Human Review`
- Cryptographic SHA-256 block hashes, millisecond execution timers, and verified digital signatures.
- **Inspect Proof Modal**: Raw JSON ledger viewer with one-click clipboard copy.

---

## 📂 Project Structure

```
loanlens-ai/
├── src/
│   ├── assets/               # Static assets & icons
│   ├── components/
│   │   ├── common/           # Reusable atomic UI components
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Badge.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Select.tsx
│   │   │   ├── ProgressBar.tsx
│   │   │   ├── Breadcrumb.tsx
│   │   │   ├── Skeleton.tsx
│   │   │   ├── EmptyState.tsx
│   │   │   ├── ErrorState.tsx
│   │   │   └── ConfirmDialog.tsx
│   │   └── layout/           # Frame components
│   │       ├── Navbar.tsx    # Global search, notifications, profile
│   │       └── Sidebar.tsx   # Enterprise navigation & active case switcher
│   ├── layouts/
│   │   └── AppLayout.tsx     # Responsive layout wrapper
│   ├── hooks/
│   │   ├── useTheme.ts       # Dark mode management with class toggle
│   │   └── useToast.tsx      # Framer Motion animated toast notification system
│   ├── services/
│   │   ├── api.ts            # Typed mock API with localStorage persistence
│   │   └── mockData.ts       # Diverse MSME loan cases, findings, and audit steps
│   ├── types/
│   │   └── index.ts          # Complete TypeScript domain contracts
│   ├── utils/
│   │   ├── cn.ts             # Tailwind merge helper
│   │   └── formatters.ts     # Currency (INR), FOIR, and date formatters
│   ├── pages/                # All 10 Application Pages
│   │   ├── LoginPage.tsx
│   │   ├── DashboardPage.tsx
│   │   ├── NewCasePage.tsx
│   │   ├── DocumentUploadPage.tsx
│   │   ├── CaseDetailsPage.tsx
│   │   ├── FindingsPage.tsx
│   │   ├── EvidenceGraphPage.tsx
│   │   ├── SimulatorPage.tsx
│   │   ├── CamPreviewPage.tsx
│   │   └── AuditTimelinePage.tsx
│   ├── App.tsx               # Route configurations
│   ├── index.css             # Tailwind directives & print styles
│   └── main.tsx              # React DOM root
├── index.html
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts
```

---

## 🛠️ Tech Stack

- **Framework**: React 18+ & TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS with custom fintech palette & Dark Mode
- **Routing**: React Router DOM (v7/v6 compatibility)
- **Forms**: React Hook Form
- **Animations**: Framer Motion
- **Data Visualization**: Recharts (Bar Charts, Donut Charts)
- **Icons**: Lucide React
- **Delight**: Canvas Confetti

---

## 💻 Getting Started

To run LoanLens AI locally:

```bash
# 1. Navigate to the project directory
cd "C:\Users\HP\.gemini\antigravity\scratch\loanlens-ai"

# 2. Start the development server
npm run dev

# 3. Build for production
npm run build

# 4. Preview production build
npm run preview
```

Open your browser at `http://localhost:3000` or the port reported in your terminal.
