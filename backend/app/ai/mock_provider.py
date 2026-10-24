"""
LoanLens AI - Mock AI Provider
Provides deterministic, zero-cost, offline simulation of AI reasoning.
Enables full development and testing without requiring live API keys.
"""
from typing import Type, TypeVar, Optional, Dict, Any
import json
from pydantic import BaseModel
from backend.app.ai.base import BaseAIProvider

T = TypeVar("T", bound=BaseModel)

class MockAIProvider(BaseAIProvider):
    """
    Mock AI Provider returning structured responses adhering to Pydantic schemas.
    Can be configured with dynamic responses for unit/integration tests.
    """

    def __init__(self, predefined_responses: Optional[Dict[str, Any]] = None):
        self.predefined_responses = predefined_responses or {}

    async def generate_structured(
        self,
        prompt: str,
        response_schema: Type[T],
        system_instruction: Optional[str] = None,
        temperature: float = 0.1,
    ) -> T:
        """
        Synthesizes a schema-compliant mock response matching the target Pydantic class.
        If a predefined response exists for this schema, it is used; otherwise, reasonable
        financial mock defaults are generated.
        """
        schema_name = response_schema.__name__
        if schema_name in self.predefined_responses:
            data = self.predefined_responses[schema_name]
            return response_schema.model_validate(data)

        # Inspect fields of response_schema to build a valid dummy instance
        sample_data = {}
        for field_name, field_info in response_schema.model_fields.items():
            field_type = field_info.annotation
            
            # Check basic types
            if field_type == str or str in getattr(field_type, "__args__", ()):
                sample_data[field_name] = f"Mock {field_name.replace('_', ' ').capitalize()}"
            elif field_type == float or float in getattr(field_type, "__args__", ()):
                sample_data[field_name] = 0.0
            elif field_type == int or int in getattr(field_type, "__args__", ()):
                sample_data[field_name] = 1
            elif field_type == bool or bool in getattr(field_type, "__args__", ()):
                sample_data[field_name] = True
            elif getattr(field_type, "__origin__", None) == list:
                sample_data[field_name] = []
            elif getattr(field_type, "__origin__", None) == dict:
                sample_data[field_name] = {}
            else:
                # Fallback for complex/nested models
                sample_data[field_name] = None

        return response_schema.model_validate(sample_data)

    async def generate_text(
        self,
        prompt: str,
        system_instruction: Optional[str] = None,
        temperature: float = 0.2,
    ) -> str:
        return "MOCK AI RESPONSE: Analysis completed under deterministic underwriting rules."
