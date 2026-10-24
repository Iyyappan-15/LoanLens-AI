"""
Tests for AI Provider Adapters (Phase 1)
Using Python standard library unittest to run seamlessly in any environment.
"""
import unittest
import asyncio
from pydantic import BaseModel
from typing import Optional
from backend.app.ai.mock_provider import MockAIProvider
from backend.app.ai.factory import get_ai_provider

class DummyFinding(BaseModel):
    finding_id: str
    severity: str
    description: str
    impact_amount: float
    is_risk: bool

class TestAIProvider(unittest.TestCase):

    def test_mock_provider_structured_default_generation(self):
        provider = MockAIProvider()
        result = asyncio.run(provider.generate_structured(
            prompt="Analyze sales discrepancy",
            response_schema=DummyFinding
        ))

        self.assertIsInstance(result, DummyFinding)
        self.assertEqual(result.impact_amount, 0.0)
        self.assertTrue(result.is_risk)
        self.assertTrue("Mock" in result.finding_id)

    def test_mock_provider_custom_responses(self):
        custom_data = {
            "DummyFinding": {
                "finding_id": "FIND-001",
                "severity": "HIGH",
                "description": "GST turnover exceeds bank credits by 27.5%",
                "impact_amount": 1600000.0,
                "is_risk": True
            }
        }
        provider = MockAIProvider(predefined_responses=custom_data)
        result = asyncio.run(provider.generate_structured(
            prompt="Analyze sales discrepancy",
            response_schema=DummyFinding
        ))

        self.assertEqual(result.finding_id, "FIND-001")
        self.assertEqual(result.severity, "HIGH")
        self.assertEqual(result.impact_amount, 1600000.0)
        self.assertTrue(result.is_risk)

    def test_factory_returns_mock_by_default(self):
        import os
        os.environ["AI_PROVIDER"] = "mock"
        import backend.app.ai.factory as factory_module
        factory_module._PROVIDER_INSTANCE = None  # Reset singleton
        provider = get_ai_provider()
        self.assertIsInstance(provider, MockAIProvider)

if __name__ == "__main__":
    unittest.main()
