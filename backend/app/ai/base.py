"""
LoanLens AI - Base AI Provider Interface
Defines the abstract interface for all LLM providers (Gemini, Mock, etc.)
Ensures deterministic Pydantic schema validation for all agent outputs.
"""
from abc import ABC, abstractmethod
from typing import Type, TypeVar, Optional, Dict, Any
from pydantic import BaseModel

T = TypeVar("T", bound=BaseModel)

class BaseAIProvider(ABC):
    """Abstract Base Class for LLM providers."""

    @abstractmethod
    async def generate_structured(
        self,
        prompt: str,
        response_schema: Type[T],
        system_instruction: Optional[str] = None,
        temperature: float = 0.1,
    ) -> T:
        """
        Generate a strictly validated Pydantic object from the model.
        Guarantees that the output matches response_schema.
        """
        pass

    @abstractmethod
    async def generate_text(
        self,
        prompt: str,
        system_instruction: Optional[str] = None,
        temperature: float = 0.2,
    ) -> str:
        """Generate unstructured narrative text (e.g. for conversational summaries)."""
        pass
