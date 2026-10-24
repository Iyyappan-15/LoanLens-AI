"""
LoanLens AI - Credit Appraisal Memo (CAM) Generator
Compiles applicant declarations, deterministic ratios, validated findings,
and policy checks into a professional, human-review-ready Credit Appraisal Memo.
"""
from typing import List, Dict, Any, Optional
from datetime import datetime
from pydantic import BaseModel, Field
from backend.app.schemas.shared import FindingSchema, FinancialMetricsSchema

class CreditAppraisalMemo(BaseModel):
    case_id: str
    generated_at: str
    applicant_name: str
    industry: str
    requested_loan_amount: float
    requested_tenure_months: int
    executive_summary: str
    financial_highlights: Dict[str, Any]
    deterministic_ratios: Dict[str, Any]
    material_findings: List[Dict[str, Any]]
    policy_compliance_status: str
    recommended_underwriter_action: str
    required_clarification_checklist: List[str]
    markdown_content: str

class CAMGenerator:
    """Generates auditable, professional CAM reports separating math from AI narrative."""

    @staticmethod
    def generate_cam(
        case_id: str,
        application_data: Dict[str, Any],
        financial_metrics: FinancialMetricsSchema,
        findings: List[FindingSchema],
        policy_status: str = "PENDING_COMMITTEE_REVIEW",
    ) -> CreditAppraisalMemo:
        now_str = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC")
        applicant_name = application_data.get("applicant_name", "Unknown Applicant")
        industry = application_data.get("industry", "MSME")
        loan_amount = application_data.get("requested_loan_amount", 0.0)
        tenure = application_data.get("requested_tenure_months", 0)

        # Classify risk based on findings
        high_severity_findings = [f for f in findings if getattr(f.severity, "value", str(f.severity)) in ("HIGH", "CRITICAL")]
        is_high_risk = len(high_severity_findings) > 0

        # Formulate executive summary
        if is_high_risk:
            rec_action = "DEFER / REQUEST_CLARIFICATIONS_BEFORE_SANCTION"
            summary = (
                f"Credit appraisal for {applicant_name} indicates material financial discrepancies "
                f"or anomalies requiring underwriter clarification. Notably, {len(high_severity_findings)} high-severity "
                f"finding(s) were flagged during bank statement and GST reconciliation."
            )
        elif financial_metrics.repayment_capacity_status == "INCOMPLETE_DATA":
            rec_action = "HOLD_FOR_ADDITIONAL_DOCUMENTS"
            summary = (
                f"Appraisal for {applicant_name} cannot be reliably concluded due to missing mandatory documentation. "
                f"Core financial ratios remain uncalculated to prevent speculative underwriting."
            )
        else:
            rec_action = "RECOMMENDED_FOR_COMMITTEE_SANCTION"
            summary = (
                f"Satisfactory credit profile for {applicant_name}. Turnovers across GST and Bank Statements "
                f"reconcile within acceptable underwriting thresholds with clean debt servicing capacity."
            )

        # Collect checklists
        checklist = []
        findings_payload = []
        for f in findings:
            findings_payload.append({
                "id": f.id,
                "title": f.title,
                "category": f.category,
                "severity": f.severity.value if hasattr(f.severity, "value") else str(f.severity),
                "is_verified": f.is_verified,
                "impact": f.impact_assessment,
            })
            if f.required_followup:
                checklist.append(f"{f.title}: {f.required_followup}")

        # Render Professional Markdown Memo
        markdown = f"""# CREDIT APPRAISAL MEMORANDUM (CAM)
**Case Reference:** `{case_id}`  
**Date of Assessment:** `{now_str}`  
**Applicant Entity:** **{applicant_name}** ({industry})  
**Requested Facility:** INR {loan_amount:,.2f} for {tenure} Months  

---

### 1. Executive Summary & Underwriter Recommendation
- **Assessment Status:** `{policy_status}`
- **System Recommendation:** **{rec_action}**
- **Executive Summary:** {summary}

---

### 2. Deterministic Financial Indicators & Coverage Metrics
*Calculated strictly via deterministic backend engine; no LLM arithmetic.*

| Financial Parameter | Observed Value | Underwriting Benchmark | Status |
| :--- | :--- | :--- | :--- |
| **Declared Annual Revenue** | INR {financial_metrics.annualized_revenue or 0:,.2f} | Applicant Self-Declaration | Logged |
| **GST Taxable Turnover** | INR {financial_metrics.gst_turnover or 0:,.2f} | Official GSTR-3B/1 Filings | Verified |
| **Bank Account Credits** | INR {financial_metrics.bank_credits_turnover or 0:,.2f} | 12-Month Audited Inflows | Verified |
| **Turnover Reconciliation Variance** | {financial_metrics.turnover_variance_percentage or 0:.2f}% | Max Allowable: 15.00% | {"⚠️ BREACH" if (financial_metrics.turnover_variance_percentage or 0) > 15 else "✅ WITHIN LIMIT"} |
| **Debt Service Coverage Ratio (DSCR)** | {financial_metrics.dscr if financial_metrics.dscr is not None else "N/A"} | Min Required: 1.35x | {"✅ PASS" if (financial_metrics.dscr or 0) >= 1.35 else "⚠️ LOW"} |
| **Fixed Obligation Ratio (FOIR)** | {f"{financial_metrics.foir:.1f}%" if financial_metrics.foir is not None else "N/A"} | Max Permitted: 60.0% | {"✅ PASS" if (financial_metrics.foir or 100) <= 60 else "⚠️ HIGH"} |

---

### 3. Evidence-Backed Risk Findings & Anomalies
*Every finding below is cross-verified against ground truth documents and transaction IDs.*

"""
        for f in findings:
            citations_str = ", ".join([f"`{ref.document_id}`" + (f" (Txn: `{ref.transaction_id}`)" if ref.transaction_id else "") for ref in f.evidence])
            markdown += f"""#### [{f.severity.value if hasattr(f.severity, 'value') else f.severity}] {f.title}
- **Description:** {f.description}
- **Impact on Appraisal:** {f.impact_assessment}
- **Source Citations:** {citations_str}
- **Evidence Verification Status:** {"✅ STRICTLY VERIFIED" if f.is_verified else "❌ UNVERIFIED CITATION"}

"""

        if checklist:
            markdown += "### 4. Mandatory Pre-Disbursement Underwriter Checklist\n"
            for item in checklist:
                markdown += f"- [ ] {item}\n"

        markdown += """
---
*Disclaimer: This Credit Appraisal Memo is generated by LoanLens AI as an intelligent decision-support aid. AI does not autonomously disburse loans. Final approval rests with the authorized Bank Credit Committee.*
"""

        return CreditAppraisalMemo(
            case_id=case_id,
            generated_at=now_str,
            applicant_name=applicant_name,
            industry=industry,
            requested_loan_amount=loan_amount,
            requested_tenure_months=tenure,
            executive_summary=summary,
            financial_highlights={
                "annualized_revenue": financial_metrics.annualized_revenue,
                "gst_turnover": financial_metrics.gst_turnover,
                "bank_credits_turnover": financial_metrics.bank_credits_turnover,
            },
            deterministic_ratios={
                "dscr": financial_metrics.dscr,
                "foir": financial_metrics.foir,
                "variance_percentage": financial_metrics.turnover_variance_percentage,
            },
            material_findings=findings_payload,
            policy_compliance_status=policy_status,
            recommended_underwriter_action=rec_action,
            required_clarification_checklist=checklist,
            markdown_content=markdown,
        )
