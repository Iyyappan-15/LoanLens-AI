"""
LoanLens AI - Discrepancy Investigation Agent
Analyzes mathematical variances between GST, Bank Credits, and Declared Revenue.
Produces structured explanations, contextual hypotheses, and source citations.
"""
from typing import Dict, Any, List, Optional
from pydantic import BaseModel, Field
from backend.app.ai.base import BaseAIProvider
from backend.app.ai.factory import get_ai_provider
from backend.app.schemas.shared import FindingSchema, FindingSeverity, EvidenceReference
from backend.app.agents.evidence_validator import EvidenceValidator

class DiscrepancyInvestigationOutput(BaseModel):
    finding_title: str
    severity: FindingSeverity
    executive_summary: str
    plausible_operational_reasons: List[str]
    unresolved_questions: List[str]
    required_documents_for_clarification: List[str]
    potential_ebitda_impact: Optional[float] = None
    citations: List[EvidenceReference]

class DiscrepancyInvestigationAgent:
    """Investigates discrepancies detected by deterministic financial reconciliation."""

    def __init__(self, ai_provider: Optional[BaseAIProvider] = None):
        self.ai_provider = ai_provider or get_ai_provider()

    async def investigate_turnover_gap(
        self,
        case_id: str,
        declared_revenue: float,
        gst_turnover: float,
        bank_credits: float,
        variance_percentage: float,
        gst_doc_id: str,
        bank_doc_id: str,
        available_documents: List[str],
        available_transaction_ids: List[str],
    ) -> FindingSchema:
        """
        Orchestrates AI investigation for turnover differences while enforcing evidence checks.
        """
        prompt = f"""
        INVESTIGATION TASK: Analyze Turnover Discrepancy for Case {case_id}
        
        Deterministic Findings:
        - Declared Annual Revenue: INR {declared_revenue:,.2f}
        - GST Reported Turnover (Doc: {gst_doc_id}): INR {gst_turnover:,.2f}
        - Bank Verified Credits (Doc: {bank_doc_id}): INR {bank_credits:,.2f}
        - Variance (Shortfall): {variance_percentage:.2f}%
        
        Instructions:
        1. Formulate a structured credit finding.
        2. Propose plausible operational business reasons (e.g. cash transactions, delayed debtor collection, unbilled work-in-progress, customer advances).
        3. Formulate specific clarification questions for the borrower.
        4. NEVER claim fraud without judicial proof; use standard banking underwriting terminology.
        5. Provide exact citations using gst_doc_id and bank_doc_id.
        """

        # Call AI provider with Pydantic structured output
        result: DiscrepancyInvestigationOutput = await self.ai_provider.generate_structured(
            prompt=prompt,
            response_schema=DiscrepancyInvestigationOutput,
            system_instruction=(
                "You are a Senior Credit Risk Underwriter at a major MSME Commercial Bank. "
                "You provide factual, balanced, evidence-backed credit risk analyses. "
                "Only cite provided document IDs."
            )
        )

        # Build standard FindingSchema
        finding = FindingSchema(
            id=f"FIND-TURNOVER-{case_id}",
            case_id=case_id,
            title=result.finding_title or f"Turnover Reconciliation Gap ({variance_percentage:.1f}%)",
            category="REVENUE_RECONCILIATION",
            severity=result.severity,
            description=result.executive_summary,
            observed_values={
                "declared_revenue": declared_revenue,
                "gst_turnover": gst_turnover,
                "bank_credits": bank_credits,
                "shortfall_amount": gst_turnover - bank_credits,
                "variance_percentage": variance_percentage,
                "plausible_reasons": result.plausible_operational_reasons,
                "unresolved_questions": result.unresolved_questions,
            },
            evidence=result.citations if result.citations else [
                EvidenceReference(document_id=gst_doc_id, document_name="GST Summary Return"),
                EvidenceReference(document_id=bank_doc_id, document_name="Bank Account Statement"),
            ],
            impact_assessment=f"Borrower's actual bank inflows show a {variance_percentage:.1f}% shortfall compared to GST filings, potentially reducing debt servicing capacity.",
            required_followup="; ".join(result.required_documents_for_clarification) if result.required_documents_for_clarification else "Request debtor ledger and CA certified cash sales reconciliation.",
            is_verified=False,
        )

        # Apply Anti-Hallucination Evidence Validation
        return EvidenceValidator.verify_and_stamp_finding(
            finding=finding,
            available_documents=available_documents,
            available_transaction_ids=available_transaction_ids,
        )
