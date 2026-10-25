from decimal import Decimal

import pytest

from app.services.reconciliation import calculate_variance, reconcile_turnover


def test_case_b_gst_vs_bank_is_material():
    r = calculate_variance("gst", Decimal("5800000"), "bank_credits", Decimal("4200000"))
    assert r.shortfall_pct == Decimal("27.59")
    assert r.is_material is True


def test_case_a_is_not_material():
    results = reconcile_turnover(Decimal("6000000"), Decimal("5920000"), Decimal("5850000"))
    assert [r.shortfall_pct for r in results] == [Decimal("1.33"), Decimal("1.18"), Decimal("2.50")]
    assert not any(r.is_material for r in results)


def test_invalid_base_raises():
    with pytest.raises(ValueError):
        calculate_variance("gst", Decimal("0"), "bank_credits", Decimal("100"))