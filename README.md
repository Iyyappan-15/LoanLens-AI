# LoanLens AI
An AI-Assisted Loan Underwriting Decision-Support Platform for MSMEs

[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688.svg?style=flat&logo=fastapi)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/Frontend-React_18_%2B_TypeScript-61DAFB.svg?style=flat&logo=react)](https://reactjs.org/)
[![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL-336791.svg?style=flat&logo=postgresql)](https://www.postgresql.org/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

---

## 1. Executive Summary

LoanLens AI is an explainable decision-support platform engineered for credit underwriters, loan officers, and financial analysts assessing MSME (Micro, Small, and Medium Enterprises) credit applications.

In traditional underwriting, credit officers manually compare disjointed documents—such as Bank Statements, GST Returns, Income Tax Returns (ITR), and Audited Financial Statements. This manual workflow is slow, error-prone, and susceptible to missed discrepancies.

LoanLens AI addresses this challenge through a hybrid architecture:
- **Deterministic Calculation Engine:** Calculates key ratios (DSCR, FOIR, Liquidity), reconciles turnover across documents, and enforces non-negotiable lending policy criteria.
- **Evidence-Linked AI Orchestrator:** Investigates transaction anomalies, interprets contextual discrepancies, drafts the Credit Appraisal Memo (CAM), and guarantees that every material claim is backed by direct source references (document ID, page, transaction ID).
- **Human-in-the-Loop Governance:** AI does not sanction loans or disburse funds autonomously. The authorized credit officer conducts final reviews via an auditable, mock decision ledger.

---

## 2. Core Architectural Principles

```text
  +--------------------------------------------------------+
  |              React + TypeScript Frontend               |
  |     (Dashboard, Evidence Graph, What-If Simulator)     |
  +---------------------------+----------------------------+
                              | REST API (JSON)
  +---------------------------v----------------------------+
  |                    FastAPI Backend                     |
  +--------------------------------------------------------+
  | 1. Document Extraction & Source Citation Tracking      |
  | 2. Deterministic Financial & Reconciliation Engine     |
  | 3. Configurable Lending Policy Rules (Hard Gates)      |
  | 4. AI Investigation Orchestrator (Multi-Module)        |
  | 5. Credit Appraisal Memo (CAM) Generator               |
  | 6. Human Review State Machine & Mock Decision Ledger   |
  +---------------------------+----------------------------+
                              |
  +---------------------------v----------------------------+
  |            PostgreSQL (Audit Trail & Cases)            |
  +--------------------------------------------------------+
```

1. **Deterministic Calculations over LLM Math:** Financial arithmetic is handled exclusively in Python. DSCR, FOIR, turnover variances, and eligibility gates are strictly computed without relying on LLM math.
2. **Evidence-First Verification:** Every AI finding is cross-checked against source documents. Claims lacking valid source document citations or transaction links are flagged as unverified for human review.
3. **Prompt-Injection Defense:** Uploaded documents are treated as untrusted data payloads; text within files cannot alter system instructions or underwriting policy thresholds.
4. **Offline / Mock AI Capability:** A built-in mock AI provider enables seamless local development and automated testing without requiring live API credentials.

---

## 3. Repository Structure

```text
LoanLens-AI/
├── frontend/                     # React + TypeScript + Vite Web Application
│   ├── src/
│   │   ├── components/           # UI Components (Evidence Graph, Metric Cards, Uploaders)
│   │   ├── pages/                # Dashboard, Case Detail, Simulator, CAM Preview
│   │   ├── services/             # API client layer
│   │   └── types/                # TypeScript interfaces matching backend schemas
│   └── package.json
│
├── backend/                      # Python FastAPI Application
│   ├── app/
│   │   ├── main.py               # FastAPI entrypoint
│   │   ├── api/                  # API routers (cases, documents, analysis, CAM, review)
│   │   ├── models/               # Database ORM models
│   │   ├── schemas/              # Pydantic schemas (Shared Data Contracts)
│   │   ├── services/             # Core business logic (extraction, reconciliation)
│   │   ├── agents/               # AI investigation modules & CAM generator
│   │   ├── ai/                   # AI provider adapter (Mock, Gemini, OpenAI)
│   │   └── audit/                # Immutable audit event logging
│   ├── tests/                    # Unit and integration test suites
│   └── requirements.txt
│
├── docs/                         # Technical Documentation & Member Guides
│   ├── member3-ai-integration-guide.md
│   ├── architecture.md
│   └── api-contract.md
│
├── sample-data/                  # Synthetic Demonstration Cases
│   ├── case-a-consistent/        # Low-risk, reconciled MSME case
│   ├── case-b-discrepancies/     # Material GST vs. Bank Turnover discrepancy
│   └── case-c-incomplete/        # Missing documents / unreadable records
│
├── .env.example                  # Environment configuration template
├── .gitignore                    # Git ignore file
└── docker-compose.yml            # Local development orchestration
```

---

## 4. Team Ownership & Responsibilities

The project is structured across three dedicated branches and member roles:

| Member / Branch | Primary Area | Key Responsibilities |
| :--- | :--- | :--- |
| **Member 1**<br>`feature/frontend-ux` | **Frontend & UX** | - Vite + React + TypeScript setup<br>- Executive Dashboard & Case Management UI<br>- Interactive Document Uploader & Processing status<br>- Evidence Graph visualization (React Flow / Cytoscape)<br>- What-If Loan Stress Simulator<br>- CAM Preview & Human Review Workflow |
| **Member 2**<br>`feature/backend-financial-engine` | **Backend & Financial Engine** | - FastAPI setup, PostgreSQL models & migrations<br>- Document parsing & metadata persistence<br>- Deterministic Financial Ratio Engine (DSCR, FOIR)<br>- Cross-document reconciliation (GST vs. Bank vs. ITR)<br>- Configurable policy rule validation<br>- Mock Decision Ledger & Audit Trail persistence |
| **Member 3**<br>`feature/ai-investigation-agents` | **AI Agents & Integration** | - Pluggable AI adapter (Mock, Gemini, OpenAI)<br>- Discrepancy & Transaction Anomaly Investigation<br>- Evidence citation validator (anti-hallucination)<br>- Automated Credit Appraisal Memo (CAM) generator<br>- Realistic synthetic test packs (Cases A, B, and C) |

---

## 5. Getting Started (Local Development)

### Prerequisites
- Python: 3.10 or higher
- Node.js: 18.x or higher & npm
- Git
- Optional: Docker & Docker Compose (for PostgreSQL)

---

### Step 1: Clone and Switch Branch

```bash
git clone https://github.com/Iyyappan-15/LoanLens-AI.git
cd LoanLens-AI

# Switch to your team feature branch:
# Member 1: git switch feature/frontend-ux
# Member 2: git switch feature/backend-financial-engine
# Member 3: git switch feature/ai-investigation-agents
```

---

### Step 2: Backend Setup (FastAPI)

```bash
# 1. Create and activate a Python virtual environment
python -m venv venv

# Windows:
venv\Scripts\activate
# Linux/macOS:
# source venv/bin/activate

# 2. Install backend dependencies
cd backend
pip install -r requirements.txt

# 3. Configure environment variables
cp ../.env.example .env

# 4. Start the FastAPI development server
uvicorn app.main:app --reload --port 8000
```
Interactive API documentation will be available at: `http://localhost:8000/docs`

---

### Step 3: Frontend Setup (React + Vite)

```bash
# Open a new terminal
cd frontend

# 1. Install dependencies
npm install

# 2. Launch Vite dev server
npm run dev
```
Frontend development server will run at: `http://localhost:5173`

---

## 6. Synthetic Demonstration Test Cases

LoanLens AI includes three reproducible synthetic test datasets:

1. **Case A (Consistent Application):**
   - Applicant reports 60 Lakh INR turnover. GST confirms 59.2 Lakh INR, bank credits confirm 58.5 Lakh INR.
   - DSCR of 1.85x, clean repayment history, and no return/reversal transactions. Passes underwriting criteria.
2. **Case B (Material Discrepancies):**
   - Declared 60 Lakh INR sales. GST filings report 58 Lakh INR, but bank statements show only 42 Lakh INR in credits (27.58% shortfall).
   - Identifies an end-of-year circular round-trip transaction pattern (8 Lakh INR director credit followed within 24 hours by a 7.9 Lakh INR debit to a related entity). Flags high-severity finding with exact document and transaction references.
3. **Case C (Incomplete Application):**
   - Missing 6 months of mandatory bank statements and unreadable ITR summary.
   - Flags missing documentation and blocks debt-ratio estimation to prevent speculative underwriting.

---

## 7. Git Collaboration Workflow

1. Always branch from `develop`.
2. Commit with conventional prefixes:
   - `feat(area): description`
   - `fix(area): description`
   - `docs(area): description`
3. Before submitting changes, verify:
   - Backend tests: `pytest`
   - Frontend build: `npm run build`
4. Submit PRs against `develop` for review before merging to `main`.
