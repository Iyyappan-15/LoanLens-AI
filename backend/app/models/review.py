import uuid
from datetime import datetime, timezone
from decimal import Decimal
from typing import Optional

from sqlalchemy import DateTime, Enum, ForeignKey, Numeric, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base
from app.schemas.review import ReviewAction
from app.schemas.shared import CaseStatus


def _now():
    return datetime.now(timezone.utc)


class ReviewDecision(Base):
    __tablename__ = "review_decisions"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    case_id: Mapped[str] = mapped_column(ForeignKey("cases.id"), index=True)
    action: Mapped[ReviewAction] = mapped_column(Enum(ReviewAction, native_enum=False, length=20))
    reviewer_id: Mapped[str] = mapped_column(String(100))
    comment: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    previous_status: Mapped[CaseStatus] = mapped_column(Enum(CaseStatus, native_enum=False, length=40))
    new_status: Mapped[CaseStatus] = mapped_column(Enum(CaseStatus, native_enum=False, length=40))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now)


class LedgerEntry(Base):
    __tablename__ = "ledger_entries"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    case_id: Mapped[str] = mapped_column(ForeignKey("cases.id"), index=True)
    review_id: Mapped[str] = mapped_column(ForeignKey("review_decisions.id"))
    entry_type: Mapped[str] = mapped_column(String(40), default="MOCK_SANCTION")
    amount: Mapped[Decimal] = mapped_column(Numeric(14, 2))
    approved_by: Mapped[str] = mapped_column(String(100))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now)