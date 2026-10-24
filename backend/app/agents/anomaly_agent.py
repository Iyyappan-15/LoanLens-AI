"""
LoanLens AI - Transaction Anomaly Detection & Investigation Agent
Detects circular/round-trip flows, sudden month-end credit spikes, and high-frequency bounces.
"""
from typing import List, Dict, Any, Optional
from datetime import datetime
from pydantic import BaseModel
from backend.app.schemas.shared import FindingSchema, FindingSeverity, EvidenceReference
from backend.app.agents.evidence_validator import EvidenceValidator

class CircularFlowDetection(BaseModel):
    is_anomaly: bool
    credit_txn: Dict[str, Any]
    debit_txn: Dict[str, Any]
    amount_difference: float
    time_window_hours: float
    explanation: str

class TransactionAnomalyAgent:
    """
    Combines rule-based transaction pattern scanning with structured anomaly explanations.
    """

    @staticmethod
    def detect_round_trip_transactions(
        case_id: str,
        bank_doc_id: str,
        transactions: List[Dict[str, Any]],
        available_documents: List[str],
        available_transaction_ids: List[str],
        amount_tolerance_percent: float = 0.05,
        time_window_days: int = 3,
    ) -> List[FindingSchema]:
        """
        Detects circular round-trip patterns (e.g. large credit followed quickly by similar debit).
        Common in window-dressing before financial year-end.
        """
        findings: List[FindingSchema] = []
        credits = [t for t in transactions if t.get("type") == "CREDIT"]
        debits = [t for t in transactions if t.get("type") == "DEBIT"]

        for c in credits:
            c_amt = c.get("amount", 0.0)
            if c_amt < 100000.0:  # Focus on material amounts (> 1 Lakh)
                continue

            c_date = datetime.strptime(c.get("date"), "%Y-%m-%d")

            for d in debits:
                d_amt = d.get("amount", 0.0)
                d_date = datetime.strptime(d.get("date"), "%Y-%m-%d")

                # Check if debit happened within window after credit
                delta_days = (d_date - c_date).days
                if 0 <= delta_days <= time_window_days:
                    amt_diff = abs(c_amt - d_amt)
                    if (amt_diff / c_amt) <= amount_tolerance_percent:
                        # Found a circular/round-trip transaction match!
                        finding_id = f"FIND-ANOMALY-ROUNDTRIP-{c.get('transaction_id')}"
                        finding = FindingSchema(
                            id=finding_id,
                            case_id=case_id,
                            title="Circular / Round-Trip Transaction Detected (Potential Window Dressing)",
                            category="TRANSACTION_ANOMALY",
                            severity=FindingSeverity.HIGH,
                            description=(
                                f"A large credit of INR {c_amt:,.2f} ({c.get('narration')}) was followed within "
                                f"{delta_days} days by a corresponding debit of INR {d_amt:,.2f} ({d.get('narration')}). "
                                f"This pattern indicates potential artificial turnover inflation or temporary liquidity infusion."
                            ),
                            observed_values={
                                "credit_transaction_id": c.get("transaction_id"),
                                "credit_amount": c_amt,
                                "debit_transaction_id": d.get("transaction_id"),
                                "debit_amount": d_amt,
                                "days_apart": delta_days,
                            },
                            evidence=[
                                EvidenceReference(
                                    document_id=bank_doc_id,
                                    document_name="Bank Statement",
                                    transaction_id=c.get("transaction_id"),
                                    extracted_text_snippet=f"{c.get('date')} | CREDIT | {c_amt} | {c.get('narration')}",
                                ),
                                EvidenceReference(
                                    document_id=bank_doc_id,
                                    document_name="Bank Statement",
                                    transaction_id=d.get("transaction_id"),
                                    extracted_text_snippet=f"{d.get('date')} | DEBIT | {d_amt} | {d.get('narration')}",
                                ),
                            ],
                            impact_assessment="Artificially inflates bank turnover calculations. Credit underwriting must deduct this transaction from genuine operating cash flows.",
                            required_followup="Request ledger accounts for related entities and clarification letter signed by the Managing Partner.",
                            is_verified=False,
                        )

                        # Enforce anti-hallucination validation
                        validated_finding = EvidenceValidator.verify_and_stamp_finding(
                            finding=finding,
                            available_documents=available_documents,
                            available_transaction_ids=available_transaction_ids,
                        )
                        findings.append(validated_finding)

        return findings
