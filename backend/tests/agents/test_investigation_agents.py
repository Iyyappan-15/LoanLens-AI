"""
Unit & Integration Tests for Phase 3:
Tests Discrepancy Investigation, Round-Trip Anomaly Detection, and Evidence Citation Validation.
"""
import unittest
import asyncio
import json
import os
from backend.app.schemas.shared import FindingSeverity, EvidenceReference
from backend.app.agents.evidence_validator import EvidenceValidator
from backend.app.agents.discrepancy_agent import DiscrepancyInvestigationAgent
from backend.app.agents.anomaly_agent import TransactionAnomalyAgent
from backend.app.ai.mock_provider import MockAIProvider

class TestPhase3Agents(unittest.TestCase):

    def setUp(self):
        self.base_dir = os.path.join(os.path.dirname(__file__), "..", "..", "..", "sample-data")

    def test_evidence_validator_valid_citations(self):
        available_docs = ["DOC-GST-001", "DOC-BANK-001"]
        available_txns = ["TXN-A-101", "TXN-A-102"]

        citations = [
            EvidenceReference(document_id="DOC-GST-001", document_name="GST"),
            EvidenceReference(document_id="DOC-BANK-001", document_name="Bank", transaction_id="TXN-A-101"),
        ]

        result = EvidenceValidator.validate_citations(
            evidence_list=citations,
            available_documents=available_docs,
            available_transaction_ids=available_txns,
        )

        self.assertTrue(result.is_valid)
        self.assertEqual(len(result.verified_citations), 2)
        self.assertEqual(len(result.invalid_citations), 0)

    def test_evidence_validator_rejects_hallucinations(self):
        available_docs = ["DOC-GST-001", "DOC-BANK-001"]
        available_txns = ["TXN-A-101"]

        # Citation with non-existent doc and hallucinated transaction
        fake_citations = [
            EvidenceReference(document_id="DOC-FAKE-999", document_name="Fake Doc"),
            EvidenceReference(document_id="DOC-BANK-001", document_name="Bank", transaction_id="TXN-HALLUCINATED-777"),
        ]

        result = EvidenceValidator.validate_citations(
            evidence_list=fake_citations,
            available_documents=available_docs,
            available_transaction_ids=available_txns,
        )

        self.assertFalse(result.is_valid)
        self.assertEqual(len(result.invalid_citations), 2)
        self.assertIn("DOC-FAKE-999", result.rejection_reasons[0])
        self.assertIn("TXN-HALLUCINATED-777", result.rejection_reasons[1])

    def test_case_b_anomaly_detection_catches_round_trip(self):
        # Load Case B bank statement
        case_b_path = os.path.join(self.base_dir, "case-b-discrepancies", "bank_statement_transactions.json")
        with open(case_b_path, "r") as f:
            bank_data = json.load(f)

        txns = bank_data["transactions"]
        txn_ids = [t["transaction_id"] for t in txns]
        doc_id = bank_data["document_id"]

        anomalies = TransactionAnomalyAgent.detect_round_trip_transactions(
            case_id="CASE-2026-002",
            bank_doc_id=doc_id,
            transactions=txns,
            available_documents=[doc_id],
            available_transaction_ids=txn_ids,
        )

        self.assertEqual(len(anomalies), 1)
        anomaly = anomalies[0]
        self.assertEqual(anomaly.category, "TRANSACTION_ANOMALY")
        self.assertEqual(anomaly.severity, FindingSeverity.HIGH)
        self.assertTrue(anomaly.is_verified)
        self.assertEqual(anomaly.observed_values["credit_transaction_id"], "TXN-B-212")
        self.assertEqual(anomaly.observed_values["debit_transaction_id"], "TXN-B-213")

    def test_discrepancy_agent_execution_with_mock(self):
        mock_response = {
            "DiscrepancyInvestigationOutput": {
                "finding_title": "Material Revenue Reconciliation Variance (27.6%)",
                "severity": "HIGH",
                "executive_summary": "GST turnover of 58L exceeds bank business credits of 42L by 16L.",
                "plausible_operational_reasons": ["Unrecorded cash sales", "Debtor realization lag"],
                "unresolved_questions": ["Where are the sales proceeds deposited?"],
                "required_documents_for_clarification": ["Debtor ledger", "Cash book"],
                "potential_ebitda_impact": 1600000.0,
                "citations": [
                    {"document_id": "DOC-GST-002", "document_name": "GST 3B"},
                    {"document_id": "DOC-BANK-002", "document_name": "Bank Statement"},
                ]
            }
        }
        provider = MockAIProvider(predefined_responses=mock_response)
        agent = DiscrepancyInvestigationAgent(ai_provider=provider)

        finding = asyncio.run(agent.investigate_turnover_gap(
            case_id="CASE-2026-002",
            declared_revenue=6000000.0,
            gst_turnover=5800000.0,
            bank_credits=4200000.0,
            variance_percentage=27.58,
            gst_doc_id="DOC-GST-002",
            bank_doc_id="DOC-BANK-002",
            available_documents=["DOC-GST-002", "DOC-BANK-002"],
            available_transaction_ids=["TXN-B-201"],
        ))

        self.assertEqual(finding.id, "FIND-TURNOVER-CASE-2026-002")
        self.assertEqual(finding.severity, FindingSeverity.HIGH)
        self.assertTrue(finding.is_verified)
        self.assertEqual(finding.observed_values["shortfall_amount"], 1600000.0)

if __name__ == "__main__":
    unittest.main()
