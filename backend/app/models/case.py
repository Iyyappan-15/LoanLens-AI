import uuid
from datetime import datetime, timezone
from decimal import Decimal

from sqlalchemy import DateTime, Enum, Integer, Numeric, String
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base
from app.schemas.shared import CaseStatus


class Case(Base):
    __tablename__ = "cases"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    applicant_name: Mapped[str] = mapped_column(String(200))
    business_name: Mapped[str] = mapped_column(String(200))
    loan_amount: Mapped[Decimal] = mapped_column(Numeric(14, 2))
    tenure_months: Mapped[int] = mapped_column(Integer)
    declared_turnover: Mapped[Decimal] = mapped_column(Numeric(14, 2))
    status: Mapped[CaseStatus] = mapped_column(
        Enum(CaseStatus, native_enum=False, length=40), default=CaseStatus.DRAFT
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )