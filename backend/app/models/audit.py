from datetime import datetime, timezone

from sqlalchemy import JSON, DateTime, Integer, String, event
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class AuditEvent(Base):
    __tablename__ = "audit_events"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    case_id: Mapped[str] = mapped_column(String, index=True)
    event_type: Mapped[str] = mapped_column(String(60))
    actor: Mapped[str] = mapped_column(String(100))
    details: Mapped[dict] = mapped_column(JSON, default=dict)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )


# Append-only: the ORM refuses to modify or delete audit rows.
@event.listens_for(AuditEvent, "before_update")
def _block_update(mapper, connection, target):
    raise RuntimeError("Audit events are append-only and cannot be modified")


@event.listens_for(AuditEvent, "before_delete")
def _block_delete(mapper, connection, target):
    raise RuntimeError("Audit events are append-only and cannot be deleted")