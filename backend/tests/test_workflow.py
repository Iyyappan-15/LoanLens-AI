import pytest

from app.schemas.shared import CaseStatus as S
from app.services.workflow import InvalidTransition, ensure_transition


def test_valid_path():
    ensure_transition(S.DRAFT, S.DOCUMENTS_UPLOADED)
    ensure_transition(S.READY_FOR_REVIEW, S.APPROVED)
    ensure_transition(S.ADDITIONAL_DOCS_REQUESTED, S.DOCUMENTS_UPLOADED)


@pytest.mark.parametrize("current,target", [
    (S.DRAFT, S.APPROVED),
    (S.DOCUMENTS_UPLOADED, S.REJECTED),
    (S.APPROVED, S.REJECTED),
    (S.REJECTED, S.READY_FOR_REVIEW),
])
def test_invalid_transitions_raise(current, target):
    with pytest.raises(InvalidTransition):
        ensure_transition(current, target)