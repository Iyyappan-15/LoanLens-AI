"""
Unit & Integration Tests for Phase 4:
Validates Evidence Graph Builder and Credit Appraisal Memo (CAM) Generator.
"""
import unittest
import json
import os
from backend.app.schemas.shared import FindingSchema, FindingSeverity, EvidenceReference, FinancialMetricsSchema
from backend.app.agents.evidence_graph_builder import EvidenceGraphBuilder
from backend.app.agents.cam_generator import CAMGenerator

class TestPhase4Deliverables(unittest.TestCase):

    def setUp(self):
        self.sample_finding = FindingSchema(
            id="FIND-TEST-001",
            case_id="CASE-2026-002",
            title="GST vs Bank Turnover Discrepancy (27.58%)",
            category="REVENUE_RECONCILIATION",
            severity=FindingSeverity.HIGH,
            description="Bank credits shortfall of 16L against GST filings.",
            evidence=[
                EvidenceReference(document_id="DOC-GST-002", document_name="GST Return"),
                EvidenceReference(document_id="DOC-BANK-002", document_name="Bank Statement", transaction_id="TXN-B-212"),
            ],
            impact_assessment="Reduces verified cash flow for debt service.",
            required_followup="Provide debtor realization schedule.",
            is_verified=True,
        )

        self.sample_metrics = FinancialMetricsSchema(
            case_id="CASE-2026-002",
            annualized_revenue=6000000.0,
            gst_turnover=5800000.0,
            bank_credits_turnover=4200000.0,
            turnover_variance_percentage=27.58,
            dscr=1.15,
            foir=68.5,
            existing_monthly_obligations=85000.0,
            proposed_emi=115000.0,
            repayment_capacity_status="WEAK",
        )

    def test_evidence_graph_builder_structure(self):
        documents = [
            {"document_id": "DOC-GST-002", "document_name": "GST Return", "type": "GST_RETURN"},
            {"document_id": "DOC-BANK-002", "document_name": "Bank Statement", "type": "BANK_STATEMENT"},
        ]

        graph = EvidenceGraphBuilder.build_graph(
            case_id="CASE-2026-002",
            documents=documents,
            findings=[self.sample_finding],
        )

        self.assertEqual(graph.case_id, "CASE-2026-002")
        node_ids = [n.id for n in graph.nodes]

        # Verify all necessary node layers are created
        self.assertIn("DOC-GST-002", node_ids)
        self.assertIn("DOC-BANK-002", node_ids)
        self.assertIn("TXN-TXN-B-212", node_ids)
        self.assertIn("FIND-TEST-001", node_ids)
        self.assertIn("CAM-SECTION-RISK-ASSESSMENT", node_ids)

        # Verify edges exist linking document to transaction and transaction to finding
        edge_relations = [e.relationship for e in graph.edges]
        self.assertIn("EXTRACTED_FROM", edge_relations)
        self.assertIn("EVIDENCED_BY", edge_relations)
        self.assertIn("INCLUDED_IN", edge_relations)

    def test_cam_generator_produces_valid_memo(self):
        application_data = {
            "applicant_name": "ABC Manufacturing Enterprises LLP",
            "industry": "Textile Weaving",
            "requested_loan_amount": 4500000.0,
            "requested_tenure_months": 48,
        }

        cam = CAMGenerator.generate_cam(
            case_id="CASE-2026-002",
            application_data=application_data,
            financial_metrics=self.sample_metrics,
            findings=[self.sample_finding],
            policy_status="REFERRED_TO_COMMITTEE",
        )

        self.assertEqual(cam.case_id, "CASE-2026-002")
        self.assertEqual(cam.applicant_name, "ABC Manufacturing Enterprises LLP")
        self.assertEqual(cam.recommended_underwriter_action, "DEFER / REQUEST_CLARIFICATIONS_BEFORE_SANCTION")
        self.assertEqual(len(cam.material_findings), 1)
        self.assertTrue(cam.material_findings[0]["is_verified"])
        
        # Verify markdown content contains the key financial data and finding
        self.assertIn("CREDIT APPRAISAL MEMORANDUM", cam.markdown_content)
        self.assertIn("27.58%", cam.markdown_content)
        self.assertIn("DOC-GST-002", cam.markdown_content)
        self.assertIn("TXN-B-212", cam.markdown_content)

if __name__ == "__main__":
    unittest.main()
