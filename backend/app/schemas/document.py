from datetime import datetime
from enum import Enum

from pydantic import BaseModel, ConfigDict


class DocumentType(str, Enum):
    BANK_STATEMENT = "BANK_STATEMENT"
    GST_RETURN = "GST_RETURN"
    ITR = "ITR"
    FINANCIAL_STATEMENT = "FINANCIAL_STATEMENT"


MANDATORY_DOCUMENT_TYPES = [
    DocumentType.BANK_STATEMENT,
    DocumentType.GST_RETURN,
    DocumentType.ITR,
]


class DocumentOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    case_id: str
    doc_type: DocumentType
    original_filename: str
    size_bytes: int
    uploaded_at: datetime


class CompletenessOut(BaseModel):
    case_id: str
    is_complete: bool
    present: list[DocumentType]
    missing: list[DocumentType]