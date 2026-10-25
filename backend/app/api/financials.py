from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.case import Case
from app.models.document import Document
from app.models.financial_inputs import FinancialInputs
from app.rules.underwriting_rules import MAX_FOIR, MIN_DSCR
from app.schemas.document import MANDATORY_DOCUMENT_TYPES
from app.schemas.financial import FinancialInputsIn, FinancialInputsOut
from app.schemas.shared import FinancialMetricsSchema
from app.services.financial_engine import calculate_dscr, calculate_emi, calculate_foir
from app.services.reconciliation import calculate_variance

router = APIRouter(prefix="/api/v1/cases", tags=["financials"])


def _get_case_or_404(db: Session, case_id: str) -> Case:
    case = db.get(Case, case_id)
    if case is None:
        raise HTTPException(status_code=404, detail=f"Case {case_id} not found")
    return case


@router.put("/{case_id}/financial-inputs", response_model=FinancialInputsOut)
def save_financial_inputs(case_id: str, payload: FinancialInputsIn, db: Session = Depends(get_db)):
    _get_case_or_404(db, case_id)
    row = db.get(FinancialInputs, case_id)
    if row is None:
        row = FinancialInputs(case_id=case_id, **payload.model_dump())
        db.add(row)
    else:
        for field, value in payload.model_dump().items():
            setattr(row, field, value)
    db.commit()
    db.refresh(row)
    return row


@router.get("/{case_id}/financials", response_model=FinancialMetricsSchema)
def get_financials(case_id: str, db: Session = Depends(get_db)):
    case = _get_case_or_404(db, case_id)

    # Gate 1: mandatory documents must be present before any estimation.
    present = set(db.scalars(select(Document.doc_type).where(Document.case_id == case_id)).all())
    missing = [t.value for t in MANDATORY_DOCUMENT_TYPES if t not in present]
    if missing:
        raise HTTPException(
            status_code=422,
            detail={
                "message": "Cannot estimate financial ratios: mandatory documents are missing",
                "missing_documents": missing,
            },
        )

    # Gate 2: extracted/entered figures must exist.
    inputs = db.get(FinancialInputs, case_id)
    if inputs is None:
        raise HTTPException(
            status_code=422,
            detail="Financial inputs not provided. Use PUT /api/v1/cases/{id}/financial-inputs",
        )

    emi = calculate_emi(case.loan_amount, inputs.interest_rate_pct, case.tenure_months)
    annual_debt_service = (emi + inputs.existing_monthly_obligations) * 12
    dscr = calculate_dscr(inputs.annual_net_operating_income, annual_debt_service)

    foir = None
    if inputs.annual_net_operating_income > 0:
        monthly_income = inputs.annual_net_operating_income / 12
        foir = calculate_foir(inputs.existing_monthly_obligations + emi, monthly_income)

    variance = calculate_variance(
        "gst", inputs.gst_turnover, "bank_credits", inputs.bank_credits_turnover
    )

    adequate = dscr >= MIN_DSCR and foir is not None and foir <= MAX_FOIR

    return FinancialMetricsSchema(
        case_id=case_id,
        annualized_revenue=float(case.declared_turnover),
        gst_turnover=float(inputs.gst_turnover),
        bank_credits_turnover=float(inputs.bank_credits_turnover),
        turnover_variance_percentage=float(variance.shortfall_pct),
        dscr=float(dscr),
        foir=float(foir) if foir is not None else None,
        existing_monthly_obligations=float(inputs.existing_monthly_obligations),
        proposed_emi=float(emi),
        repayment_capacity_status="ADEQUATE" if adequate else "WEAK",
    )