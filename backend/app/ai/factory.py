"""
LoanLens AI - AI Provider Factory
Selects the appropriate provider based on environment configuration.
"""
import os
from backend.app.ai.base import BaseAIProvider
from backend.app.ai.mock_provider import MockAIProvider
from backend.app.ai.gemini_provider import GeminiAIProvider

_PROVIDER_INSTANCE = None

def get_ai_provider() -> BaseAIProvider:
    """
    Returns the configured AI Provider singleton.
    Provider type is controlled by AI_PROVIDER env variable:
    - 'mock' (Default for local testing and CI)
    - 'gemini' (Production / Live evaluation)
    """
    global _PROVIDER_INSTANCE
    if _PROVIDER_INSTANCE is not None:
        return _PROVIDER_INSTANCE

    provider_type = os.getenv("AI_PROVIDER", "mock").lower()

    if provider_type == "gemini":
        _PROVIDER_INSTANCE = GeminiAIProvider()
    elif provider_type == "mock":
        _PROVIDER_INSTANCE = MockAIProvider()
    else:
        raise ValueError(
            f"Unsupported AI_PROVIDER '{provider_type}'. Supported providers: 'mock', 'gemini'."
        )

    return _PROVIDER_INSTANCE
