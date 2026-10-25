from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field

from app.schemas.shared import CaseStatus


class CaseCreate(BaseModel):
    applicant_name: str = Field(min_length=1, max_length=200)
    business_name: str = Field(min_length=1, max_length=200)
    loan_amount: Decimal = Field(gt=0)
    tenure_months: int = Field(gt=0, le=360)
    declared_turnover: Decimal = Field(ge=0)


class CaseOut(CaseCreate):
    model_config = ConfigDict(from_attributes=True)

    id: str
    status: CaseStatus
    created_at: datetime