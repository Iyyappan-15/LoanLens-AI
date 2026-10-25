from app.schemas.shared import CaseStatus as S

ALLOWED_TRANSITIONS: dict[S, set[S]] = {
    S.DRAFT: {S.DOCUMENTS_UPLOADED},
    S.DOCUMENTS_UPLOADED: {S.ANALYSIS_IN_PROGRESS},
    S.ANALYSIS_IN_PROGRESS: {S.READY_FOR_REVIEW},
    S.READY_FOR_REVIEW: {S.APPROVED, S.REJECTED, S.ADDITIONAL_DOCS_REQUESTED},
    S.ADDITIONAL_DOCS_REQUESTED: {S.DOCUMENTS_UPLOADED},
    S.APPROVED: set(),
    S.REJECTED: set(),
}


class InvalidTransition(Exception):
    pass


def ensure_transition(current: S, target: S) -> None:
    if target not in ALLOWED_TRANSITIONS[current]:
        allowed = sorted(s.value for s in ALLOWED_TRANSITIONS[current]) or ["none (final state)"]
        raise InvalidTransition(
            f"Cannot move case from {current.value} to {target.value}. Allowed: {allowed}"
        )