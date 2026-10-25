from datetime import datetime
from decimal import Decimal
from enum import Enum
from typing import Optional

from pydantic import BaseModel, ConfigDict, model_validator

from app.schemas.shared import CaseStatus


class ReviewAction(str, Enum):
    APPROVE = "APPROVE"
    REJECT = "REJECT"
    REQUEST_INFO = "REQUEST_INFO"


class ReviewIn(BaseModel):
    action: ReviewAction
    comment: Optional[str] = None

    @model_validator(mode="after")
    def comment_required_unless_approve(self):
        if self.action != ReviewAction.APPROVE and not (self.comment and self.comment.strip()):
            raise ValueError("comment is required for REJECT and REQUEST_INFO")
        return self


class ReviewOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    case_id: str
    action: ReviewAction
    reviewer_id: str
    comment: Optional[str]
    previous_status: CaseStatus
    new_status: CaseStatus
    created_at: datetime


class LedgerEntryOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    case_id: str
    review_id: str
    entry_type: str
    amount: Decimal
    approved_by: str
    created_at: datetime


class AuditEventOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    case_id: str
    event_type: str
    actor: str
    details: dict
    created_at: datetime


class StatusChangeIn(BaseModel):
    target: CaseStatus