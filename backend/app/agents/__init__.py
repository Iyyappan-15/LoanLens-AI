"""Package initialization for backend.app.agents"""
from backend.app.agents.evidence_validator import EvidenceValidator, CitationValidationResult
from backend.app.agents.discrepancy_agent import DiscrepancyInvestigationAgent, DiscrepancyInvestigationOutput
from backend.app.agents.anomaly_agent import TransactionAnomalyAgent
from backend.app.agents.evidence_graph_builder import (
    EvidenceGraphBuilder,
    EvidenceGraphResponse,
    GraphNode,
    GraphEdge,
)
from backend.app.agents.cam_generator import CAMGenerator, CreditAppraisalMemo

__all__ = [
    "EvidenceValidator",
    "CitationValidationResult",
    "DiscrepancyInvestigationAgent",
    "DiscrepancyInvestigationOutput",
    "TransactionAnomalyAgent",
    "EvidenceGraphBuilder",
    "EvidenceGraphResponse",
    "GraphNode",
    "GraphEdge",
    "CAMGenerator",
    "CreditAppraisalMemo",
]
