from typing import Optional

from fastapi import APIRouter, Depends, Header, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.audit.logger import log_event
from app.database import get_db
from app.models.audit import AuditEvent
from app.models.case import Case
from app.models.document import Document
from app.models.review import LedgerEntry, ReviewDecision
from app.schemas.case import CaseOut
from app.schemas.document import MANDATORY_DOCUMENT_TYPES
from app.schemas.review import (
    AuditEventOut,
    LedgerEntryOut,
    ReviewAction,
    ReviewIn,
    ReviewOut,
    StatusChangeIn,
)
from app.schemas.shared import CaseStatus
from app.services.workflow import InvalidTransition, ensure_transition

router = APIRouter(prefix="/api/v1/cases", tags=["review"])

AUTHORIZED_ROLES = {"CREDIT_OFFICER"}
ACTION_TO_STATUS = {
    ReviewAction.APPROVE: CaseStatus.APPROVED,
    ReviewAction.REJECT: CaseStatus.REJECTED,
    ReviewAction.REQUEST_INFO: CaseStatus.ADDITIONAL_DOCS_REQUESTED,
}
REVIEW_ONLY_TARGETS = set(ACTION_TO_STATUS.values())


def require_reviewer(
    x_reviewer_id: Optional[str] = Header(None),
    x_reviewer_role: Optional[str] = Header(None),
) -> str:
    # MOCK auth via headers. Replace with real authentication before production.
    if not x_reviewer_id or not x_reviewer_role:
        raise HTTPException(status_code=401, detail="X-Reviewer-Id and X-Reviewer-Role headers are required")
    if x_reviewer_role not in AUTHORIZED_ROLES:
        raise HTTPException(status_code=403, detail=f"Role '{x_reviewer_role}' is not authorized to review cases")
    return x_reviewer_id


def _case_or_404(db: Session, case_id: str) -> Case:
    case = db.get(Case, case_id)
    if case is None:
        raise HTTPException(status_code=404, detail=f"Case {case_id} not found")
    return case


@router.post("/{case_id}/status", response_model=CaseOut)
def advance_status(case_id: str, payload: StatusChangeIn, db: Session = Depends(get_db)):
    """Moves a case through the non-review states. Decisions go through /review only."""
    case = _case_or_404(db, case_id)

    if payload.target in REVIEW_ONLY_TARGETS:
        raise HTTPException(status_code=403, detail="Use POST /review for approve, reject or request-info")

    try:
        ensure_transition(case.status, payload.target)
    except InvalidTransition as e:
        raise HTTPException(status_code=409, detail=str(e))

    if payload.target == CaseStatus.DOCUMENTS_UPLOADED:
        present = set(db.scalars(select(Document.doc_type).where(Document.case_id == case_id)).all())
        missing = [t.value for t in MANDATORY_DOCUMENT_TYPES if t not in present]
        if missing:
            raise HTTPException(
                status_code=422,
                detail={"message": "Mandatory documents are missing", "missing_documents": missing},
            )

    previous = case.status
    case.status = payload.target
    log_event(db, case_id, "STATUS_CHANGED", "system",
              {"from": previous.value, "to": payload.target.value})
    db.commit()
    db.refresh(case)
    return case


@router.post("/{case_id}/review", response_model=ReviewOut, status_code=status.HTTP_201_CREATED)
def submit_review(
    case_id: str,
    payload: ReviewIn,
    reviewer_id: str = Depends(require_reviewer),
    db: Session = Depends(get_db),
):
    case = _case_or_404(db, case_id)
    target = ACTION_TO_STATUS[payload.action]

    try:
        ensure_transition(case.status, target)
    except InvalidTransition as e:
        raise HTTPException(status_code=409, detail=str(e))

    previous = case.status
    case.status = target

    review = ReviewDecision(
        case_id=case_id,
        action=payload.action,
        reviewer_id=reviewer_id,
        comment=payload.comment,
        previous_status=previous,
        new_status=target,
    )
    db.add(review)
    db.flush()  # assigns review.id

    # The ONLY place a ledger entry is ever created.
    if payload.action == ReviewAction.APPROVE:
        db.add(LedgerEntry(
            case_id=case_id,
            review_id=review.id,
            amount=case.loan_amount,
            approved_by=reviewer_id,
        ))

    log_event(db, case_id, f"REVIEW_{payload.action.value}", reviewer_id,
              {"from": previous.value, "to": target.value, "comment": payload.comment})
    db.commit()
    db.refresh(review)
    return review


@router.get("/{case_id}/ledger", response_model=list[LedgerEntryOut])
def get_ledger(case_id: str, db: Session = Depends(get_db)):
    _case_or_404(db, case_id)
    return db.scalars(select(LedgerEntry).where(LedgerEntry.case_id == case_id)).all()


@router.get("/{case_id}/audit", response_model=list[AuditEventOut])
def get_audit_trail(case_id: str, db: Session = Depends(get_db)):
    _case_or_404(db, case_id)
    return db.scalars(
        select(AuditEvent).where(AuditEvent.case_id == case_id).order_by(AuditEvent.id)
    ).all()