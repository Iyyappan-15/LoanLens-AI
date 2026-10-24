# Member 3 (AI & Investigation) — Integration Guide for Teammates

This guide explains how **Member 2 (Backend & Financial Engine)** and **Member 1 (Frontend & UX)** can seamlessly consume and connect to the AI investigation modules, synthetic datasets, evidence validator, and graph builder built on the `feature/ai-investigation-agents` branch.

---

## 1. Quick Architecture Summary

```
[Member 2: FastAPI & DB]
       │
       ▼ (Calculates raw turnover, bank credits, variance)
[Member 3: AI Investigation & Citation Validator]
       │  - DiscrepancyInvestigationAgent (Turnover shortfall analysis)
       │  - TransactionAnomalyAgent (Circular/round-trip flows)
       │  - EvidenceValidator (Rejects hallucinated doc/txn IDs)
       │  - CAMGenerator (Assembles credit appraisal memo)
       │  - EvidenceGraphBuilder (Builds node/edge DAG)
       │
       ▼ (Returns clean Pydantic JSON)
[Member 1: React + Vite Frontend]
       - Renders Findings, CAM Markdown, and React Flow Graph
```

---

## 2. Guide for Member 2 (Backend Core Integration)

Member 2 can import your modules directly into their FastAPI endpoints without needing to write any AI prompts or graph code.

### 2.1 Importing AI Modules
```python
from backend.app.ai import get_ai_provider
from backend.app.agents import (
    DiscrepancyInvestigationAgent,
    TransactionAnomalyAgent,
    EvidenceValidator,
    CAMGenerator,
    EvidenceGraphBuilder,
)
```

### 2.2 Triggering Discrepancy Investigation in an Endpoint
When Member 2’s financial engine detects a turnover discrepancy between GST and Bank Statements:

```python
# In your router (e.g. backend/app/api/analysis.py):
agent = DiscrepancyInvestigationAgent()

finding = await agent.investigate_turnover_gap(
    case_id=case.id,
    declared_revenue=case.declared_annual_revenue,
    gst_turnover=calculated_gst_sales,
    bank_credits=calculated_bank_credits,
    variance_percentage=variance_pct,
    gst_doc_id="DOC-GST-002",
    bank_doc_id="DOC-BANK-002",
    available_documents=["DOC-GST-002", "DOC-BANK-002"],
    available_transaction_ids=["TXN-B-201", "TXN-B-202", ...],
)
# 'finding' is a FindingSchema instance with 'is_verified=True'
```

### 2.3 Running Anomaly Detection on Bank Transactions
```python
anomalies = TransactionAnomalyAgent.detect_round_trip_transactions(
    case_id=case.id,
    bank_doc_id="DOC-BANK-002",
    transactions=case.bank_transactions,
    available_documents=["DOC-BANK-002"],
    available_transaction_ids=[t["transaction_id"] for t in case.bank_transactions],
)
# Returns a List[FindingSchema] with round-trip window dressing flagged.
```

### 2.4 Generating the Credit Appraisal Memo (CAM)
```python
cam_report = CAMGenerator.generate_cam(
    case_id=case.id,
    application_data={
        "applicant_name": case.applicant_name,
        "industry": case.industry,
        "requested_loan_amount": case.requested_loan_amount,
        "requested_tenure_months": case.requested_tenure_months,
    },
    financial_metrics=calculated_metrics,  # FinancialMetricsSchema instance
    findings=all_case_findings,           # List[FindingSchema]
    policy_status="PASS",                 # or "FAIL_TRIGGER_COMMITTEE"
)
```

### 2.5 Serving the Evidence Graph Endpoint
```python
@router.get("/cases/{case_id}/evidence-graph")
def get_evidence_graph(case_id: str):
    graph = EvidenceGraphBuilder.build_graph(
        case_id=case_id,
        documents=case_documents,
        findings=case_findings,
    )
    return graph  # Returns EvidenceGraphResponse (nodes & edges)
```

---

## 3. Guide for Member 1 (Frontend & UX Integration)

Member 1 can directly use the structured JSON payloads for the **Evidence Graph UI** and **Credit Appraisal Memo (CAM) Preview**.

### 3.1 Evidence Graph JSON Shape (`GET /api/cases/{case_id}/evidence-graph`)
Ready to render using React Flow (`@xyflow/react`) or Cytoscape:

```json
{
  "case_id": "CASE-2026-002",
  "nodes": [
    {
      "id": "DOC-BANK-002",
      "label": "Bank Statement",
      "type": "DOCUMENT",
      "category": "BANK_STATEMENT",
      "metadata": { "status": "VERIFIED" }
    },
    {
      "id": "TXN-TXN-B-212",
      "label": "Txn: TXN-B-212",
      "type": "TRANSACTION",
      "metadata": { "snippet": "2026-03-28 | CREDIT | 800000.0 | TRANSFER-FROM-DIRECTOR" }
    },
    {
      "id": "FIND-ANOMALY-ROUNDTRIP-TXN-B-212",
      "label": "Circular / Round-Trip Transaction Detected",
      "type": "FINDING",
      "severity": "HIGH",
      "metadata": { "is_verified": true }
    },
    {
      "id": "CAM-SECTION-RISK-ASSESSMENT",
      "label": "CAM: Risk Appraisal & Findings",
      "type": "CAM_SECTION",
      "metadata": { "report": "Credit Appraisal Memo" }
    }
  ],
  "edges": [
    {
      "id": "edge-1",
      "source": "DOC-BANK-002",
      "target": "TXN-TXN-B-212",
      "label": "contains",
      "relationship": "EXTRACTED_FROM"
    },
    {
      "id": "edge-2",
      "source": "TXN-TXN-B-212",
      "target": "FIND-ANOMALY-ROUNDTRIP-TXN-B-212",
      "label": "triggers",
      "relationship": "EVIDENCED_BY"
    },
    {
      "id": "edge-3",
      "source": "FIND-ANOMALY-ROUNDTRIP-TXN-B-212",
      "target": "CAM-SECTION-RISK-ASSESSMENT",
      "label": "informs",
      "relationship": "INCLUDED_IN"
    }
  ]
}
```

### 3.2 CAM Memo JSON Shape (`GET /api/cases/{case_id}/cam`)
Can be rendered directly with `react-markdown` or formatted cards:
- `cam_report.markdown_content`: Full pre-formatted Markdown memo complete with tables, ratio benchmarks, and underwriter checklists.
- `cam_report.recommended_underwriter_action`: e.g. `"RECOMMENDED_FOR_COMMITTEE_SANCTION"` or `"DEFER / REQUEST_CLARIFICATIONS_BEFORE_SANCTION"`.
- `cam_report.required_clarification_checklist`: Array of action checklist items for the human underwriter.

---

## 4. Synthetic Test Cases for Demo

Located in `sample-data/`:
1. `sample-data/case-a-consistent/`: Clean MSME case. Reconciles within 1.2% variance.
2. `sample-data/case-b-discrepancies/`: Material discrepancy case. 27.58% GST vs. Bank credit shortfall + round-trip anomaly.
3. `sample-data/case-c-incomplete/`: Incomplete case with missing bank statements and GST data.
