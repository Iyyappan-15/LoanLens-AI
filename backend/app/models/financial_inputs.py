from decimal import Decimal

from sqlalchemy import ForeignKey, Numeric, String
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class FinancialInputs(Base):
    __tablename__ = "financial_inputs"

    case_id: Mapped[str] = mapped_column(ForeignKey("cases.id"), primary_key=True)
    gst_turnover: Mapped[Decimal] = mapped_column(Numeric(14, 2))
    bank_credits_turnover: Mapped[Decimal] = mapped_column(Numeric(14, 2))
    annual_net_operating_income: Mapped[Decimal] = mapped_column(Numeric(14, 2))
    existing_monthly_obligations: Mapped[Decimal] = mapped_column(Numeric(14, 2))
    interest_rate_pct: Mapped[Decimal] = mapped_column(Numeric(5, 2))