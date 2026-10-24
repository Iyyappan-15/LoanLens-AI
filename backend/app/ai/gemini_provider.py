"""
LoanLens AI - Gemini AI Provider
Uses Google GenAI SDK (google-genai) to generate structured outputs
enforcing Pydantic schemas and preventing prompt injection.
"""
import os
from typing import Type, TypeVar, Optional
from pydantic import BaseModel
from backend.app.ai.base import BaseAIProvider

T = TypeVar("T", bound=BaseModel)

class GeminiAIProvider(BaseAIProvider):
    """Production provider using Google Gemini API."""

    def __init__(self, api_key: Optional[str] = None, model_name: str = "gemini-2.5-flash"):
        self.api_key = api_key or os.getenv("GEMINI_API_KEY")
        self.model_name = os.getenv("AI_MODEL_NAME", model_name)
        if not self.api_key:
            raise ValueError(
                "GEMINI_API_KEY is not set. Please set GEMINI_API_KEY in .env "
                "or switch AI_PROVIDER=mock."
            )
        try:
            from google import genai
            self.genai = genai
            self.client = genai.Client(api_key=self.api_key)
        except ImportError:
            raise ImportError(
                "The 'google-genai' package is required for GeminiAIProvider. "
                "Install it with: pip install google-genai"
            )

    async def generate_structured(
        self,
        prompt: str,
        response_schema: Type[T],
        system_instruction: Optional[str] = None,
        temperature: float = 0.1,
    ) -> T:
        """
        Calls Gemini using structured outputs with Pydantic response_schema.
        """
        types = self.genai.types
        config = types.GenerateContentConfig(
            temperature=temperature,
            response_mime_type="application/json",
            response_schema=response_schema,
            system_instruction=system_instruction or (
                "You are an expert, impartial Credit Underwriting AI Assistant for MSME lending. "
                "Your role is to analyze financial evidence, report discrepancies, and identify anomalies. "
                "NEVER invent or hallucinate financial transactions, document pages, or numbers. "
                "All claims MUST be backed by strict evidence citations."
            ),
        )

        response = self.client.models.generate_content(
            model=self.model_name,
            contents=prompt,
            config=config,
        )

        if not response.parsed:
            raise ValueError(f"Failed to parse structured response from Gemini: {response.text}")

        return response.parsed

    async def generate_text(
        self,
        prompt: str,
        system_instruction: Optional[str] = None,
        temperature: float = 0.2,
    ) -> str:
        """Generates standard text using Gemini."""
        types = self.genai.types
        config = types.GenerateContentConfig(
            temperature=temperature,
            system_instruction=system_instruction,
        )
        response = self.client.models.generate_content(
            model=self.model_name,
            contents=prompt,
            config=config,
        )
        return response.text or ""
