from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field


class FinancialInputsIn(BaseModel):
    gst_turnover: Decimal = Field(gt=0)
    bank_credits_turnover: Decimal = Field(ge=0)
    annual_net_operating_income: Decimal
    existing_monthly_obligations: Decimal = Field(ge=0)
    interest_rate_pct: Decimal = Field(ge=0, le=100)


class FinancialInputsOut(FinancialInputsIn):
    model_config = ConfigDict(from_attributes=True)

    case_id: str