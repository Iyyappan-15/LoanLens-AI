from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum

class CaseStatus(str, Enum):
    DRAFT = "DRAFT"
    DOCUMENTS_UPLOADED = "DOCUMENTS_UPLOADED"
    ANALYSIS_IN_PROGRESS = "ANALYSIS_IN_PROGRESS"
    READY_FOR_REVIEW = "READY_FOR_REVIEW"
    ADDITIONAL_DOCS_REQUESTED = "ADDITIONAL_DOCS_REQUESTED"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"

class FindingSeverity(str, Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"

class EvidenceReference(BaseModel):
    document_id: str
    document_name: str
    page_number: Optional[int] = None
    transaction_id: Optional[str] = None
    line_number: Optional[int] = None
    extracted_text_snippet: Optional[str] = None

class FindingSchema(BaseModel):
    id: str
    case_id: str
    title: str
    category: str
    severity: FindingSeverity
    description: str
    observed_values: dict = Field(default_factory=dict)
    evidence: List[EvidenceReference] = Field(default_factory=list)
    impact_assessment: str
    required_followup: Optional[str] = None
    is_verified: bool = False

class FinancialMetricsSchema(BaseModel):
    case_id: str
    annualized_revenue: Optional[float] = None
    gst_turnover: Optional[float] = None
    bank_credits_turnover: Optional[float] = None
    turnover_variance_percentage: Optional[float] = None
    dscr: Optional[float] = None  # Debt Service Coverage Ratio
    foir: Optional[float] = None  # Fixed Obligation to Income Ratio
    existing_monthly_obligations: Optional[float] = None
    proposed_emi: Optional[float] = None
    repayment_capacity_status: str
