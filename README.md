# LoanLens AI 🔍⚖️
> **AI-Powered Loan Underwriting Decision-Support Platform for MSMEs**

[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688.svg?style=flat&logo=fastapi)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/Frontend-React_18_%2B_TypeScript-61DAFB.svg?style=flat&logo=react)](https://reactjs.org/)
[![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL-336791.svg?style=flat&logo=postgresql)](https://www.postgresql.org/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

---

## 1. Executive Summary

**LoanLens AI** is an explainable decision-support platform engineered for credit underwriters, loan officers, and financial analysts assessing MSME (Micro, Small, and Medium Enterprises) credit applications.

In traditional underwriting, credit officers manually compare disjointed documents—such as Bank Statements, GST Returns, Income Tax Returns (ITR), and Audited Financial Statements. This manual workflow is slow, error-prone, and susceptible to missed discrepancies.

**LoanLens AI bridges this gap through a hybrid architecture:**
- **Deterministic Python Engine:** Calculates ratios (DSCR, FOIR, Liquidity), reconciles turnover across documents, and enforces non-negotiable lending policy criteria.
- **Evidence-Linked AI Orchestrator:** Investigates transaction anomalies, interprets contextual discrepancies, drafts the Credit Appraisal Memo (CAM), and guarantees that every material claim is backed by direct source references (document ID, page, transaction ID).
- **Human-in-the-Loop Governance:** AI **never** sanctions loans or disburses funds autonomously. The authorized credit officer conducts final reviews via an auditable, mock decision ledger.

---

## 2. Core Architectural Principles

```
  ┌────────────────────────────────────────────────────────┐
  │              React + TypeScript Frontend               │
  │     (Dashboard, Evidence Graph, What-If Simulator)     │
  └───────────────────────────▲────────────────────────────┘
                              │ REST API (JSON)
  ┌───────────────────────────▼────────────────────────────┐
  │                    FastAPI Backend                     │
  ├────────────────────────────────────────────────────────┤
  │ 1. Document Extraction & Source Citation Tracking      │
  │ 2. Deterministic Financial & Reconciliation Engine     │
  │ 3. Configurable Lending Policy Rules (Hard Gates)      │
  │ 4. AI Investigation Orchestrator (Multi-Module)        │
  │ 5. Credit Appraisal Memo (CAM) Generator               │
  │ 6. Human Review State Machine & Mock Decision Ledger   │
  └───────────────────────────▲────────────────────────────┘
                              │
  ┌───────────────────────────▼────────────────────────────┐
  │            PostgreSQL (Audit Trail & Cases)            │
  └────────────────────────────────────────────────────────┘
```

1. **Deterministic Calculations over LLM Math:** Never let an LLM do financial arithmetic. DSCR, FOIR, turnover variances, and eligibility gates are strictly computed in Python.
2. **Evidence-First Verification:** Any AI finding without a valid source document citation or transaction link is marked unverified and flagged for human review.
3. **Prompt-Injection Defense:** Uploaded documents are treated as untrusted data payloads; text inside PDFs cannot override system instructions or policy limits.
4. **Offline / Mock AI Capability:** A built-in mock AI provider enables seamless local development and tests without requiring live API keys.

---

## 3. Repository Structure

```text
LoanLens-AI/
├── frontend/                     # React + TypeScript + Vite Web Application
│   ├── src/
│   │   ├── components/           # UI Components (Evidence Graph, Metric Cards, Uploaders)
│   │   ├── pages/                # Dashboard, Case Detail, Simulator, CAM Preview
│   │   ├── services/             # Axios/Fetch API client layer
│   │   └── types/                # TypeScript interfaces matching backend schemas
│   └── package.json
│
├── backend/                      # Python FastAPI Application
│   ├── app/
│   │   ├── main.py               # FastAPI entrypoint
│   │   ├── api/                  # API routers (cases, documents, analysis, CAM, review)
│   │   ├── models/               # SQLAlchemy ORM models
│   │   ├── schemas/              # Pydantic schemas (Shared Data Contracts)
│   │   ├── services/             # Core business logic (extraction, reconciliation)
│   │   ├── financial_engine/     # Pure deterministic financial math & policy checks
│   │   ├── agents/               # AI investigation modules & CAM generator
│   │   ├── ai/                   # AI provider adapter (Mock, Gemini, OpenAI)
│   │   └── audit/                # Immutable audit event logging
│   ├── tests/                    # Pytest unit and integration tests
│   └── requirements.txt
│
├── docs/                         # Technical Documentation
│   ├── architecture.md           # System design and sequence diagrams
│   ├── api-contract.md           # REST API endpoints & request/response payloads
│   └── demo-script.md            # Hackathon presentation walkthrough
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
| **Member 1**<br>`feature/frontend-ux` | **Frontend & UX** | • Vite + React + TypeScript setup<br>• Executive Dashboard & Case Management UI<br>• Interactive Document Uploader & Processing status<br>• Interactive Evidence Graph (Flow/Cytoscape)<br>• What-If Loan Stress Simulator<br>• CAM Preview & Human Review Workflow |
| **Member 2**<br>`feature/backend-financial-engine` | **Backend & Financial Engine** | • FastAPI setup, PostgreSQL models & migrations<br>• Document parsing & metadata persistence<br>• Deterministic Financial Ratio Engine (DSCR, FOIR)<br>• Cross-document reconciliation (GST vs. Bank vs. ITR)<br>• Configurable policy rule validation<br>• Mock Decision Ledger & Audit Trail persistence |
| **Member 3**<br>`feature/ai-investigation-agents` | **AI Agents & Investigation** | • Pluggable AI adapter (`mock`, `gemini`, `openai`)<br>• Discrepancy & Transaction Anomaly Investigation<br>• Evidence citation validator (anti-hallucination)<br>• Automated Credit Appraisal Memo (CAM) generator<br>• Realistic synthetic test packs (Cases A, B, and C) |

---

## 5. Getting Started (Local Development)

### Prerequisites
- **Python:** 3.10 or higher
- **Node.js:** 18.x or higher & `npm` / `pnpm`
- **Git**
- Optional: **Docker & Docker Compose** (for PostgreSQL)

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
API Documentation will be live at: **[http://localhost:8000/docs](http://localhost:8000/docs)**

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
Frontend will be accessible at: **[http://localhost:5173](http://localhost:5173)**

---

## 6. Synthetic Demonstration Test Cases

To guarantee a reliable, reproducible hackathon demonstration, LoanLens AI ships with 3 synthetic test cases:

1. **Case A (Consistent Application):**
   - Applicant reports ₹60L turnover. GST confirms ₹59.2L, bank credits ₹58.5L.
   - Clean DSCR (1.8x), negligible return/reversal transactions. Passes all lending gates.
2. **Case B (Material Discrepancies):**
   - Declared ₹60L sales. GST filings report ₹58L, but bank statements only reflect ₹42L business credits.
   - High debit churn and unexplained large credit transactions. Flags high-severity finding with exact document references.
3. **Case C (Incomplete Application):**
   - Missing 6 months of bank statements and unreadable ITR summary.
   - System flags data-quality insufficiency, refuses to guess missing metrics, and requests manual document follow-up.

---

## 7. Git Collaboration Workflow

1. Always branch from `develop`.
2. Commit with standard prefixes:
   - `feat(area): description` (e.g. `feat(engine): add DSCR and FOIR formula`)
   - `fix(area): description` (e.g. `fix(parser): handle date format edge cases`)
   - `docs(area): description`
3. Before pushing, verify:
   - Backend tests: `pytest`
   - Frontend build: `npm run build`
4. Submit PRs against `develop` for review before merging to `main`.
