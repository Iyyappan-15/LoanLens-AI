"""
Unit Tests for Synthetic Demonstration Cases (Phase 2)
Verifies that all 3 demonstration datasets exist and have consistent ground truth.
"""
import unittest
import os
import json

class TestSyntheticDatasets(unittest.TestCase):

    def setUp(self):
        self.base_dir = os.path.join(os.path.dirname(__file__), "..", "..", "..", "sample-data")

    def test_case_a_consistent_data(self):
        case_a_dir = os.path.join(self.base_dir, "case-a-consistent")
        self.assertTrue(os.path.exists(os.path.join(case_a_dir, "application.json")))
        self.assertTrue(os.path.exists(os.path.join(case_a_dir, "gst_summary.json")))
        self.assertTrue(os.path.exists(os.path.join(case_a_dir, "bank_statement_transactions.json")))
        self.assertTrue(os.path.exists(os.path.join(case_a_dir, "ground_truth.json")))

        with open(os.path.join(case_a_dir, "ground_truth.json"), "r") as f:
            gt = json.load(f)
            self.assertEqual(gt["expected_risk_level"], "LOW")
            self.assertEqual(gt["expected_discrepancies_count"], 0)

    def test_case_b_discrepancy_data(self):
        case_b_dir = os.path.join(self.base_dir, "case-b-discrepancies")
        with open(os.path.join(case_b_dir, "ground_truth.json"), "r") as f:
            gt = json.load(f)
            self.assertEqual(gt["expected_risk_level"], "HIGH")
            self.assertGreater(gt["reconciliation_variance_percentage"], 20.0)

        with open(os.path.join(case_b_dir, "bank_statement_transactions.json"), "r") as f:
            bank = json.load(f)
            txn_ids = [t["transaction_id"] for t in bank["transactions"]]
            self.assertIn("TXN-B-212", txn_ids)
            self.assertIn("TXN-B-213", txn_ids)

    def test_case_c_incomplete_data(self):
        case_c_dir = os.path.join(self.base_dir, "case-c-incomplete")
        with open(os.path.join(case_c_dir, "ground_truth.json"), "r") as f:
            gt = json.load(f)
            self.assertEqual(gt["expected_risk_level"], "INCOMPLETE_DATA")
            self.assertEqual(len(gt["missing_documents"]), 2)

if __name__ == "__main__":
    unittest.main()
