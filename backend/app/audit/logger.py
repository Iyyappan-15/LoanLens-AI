from typing import Optional

from sqlalchemy.orm import Session

from app.models.audit import AuditEvent


def log_event(db: Session, case_id: str, event_type: str, actor: str, details: Optional[dict] = None) -> None:
    """Adds an audit row to the current transaction. The caller commits, so the
    audit entry and the change it describes succeed or fail together."""
    db.add(AuditEvent(case_id=case_id, event_type=event_type, actor=actor, details=details or {}))