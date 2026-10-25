from decimal import Decimal

import pytest

from app.services.financial_engine import calculate_dscr, calculate_emi, calculate_foir


def test_emi_standard_loan():
    assert calculate_emi(Decimal("1000000"), Decimal("12"), 12) == Decimal("88848.79")


def test_emi_zero_interest():
    assert calculate_emi(Decimal("120000"), Decimal("0"), 12) == Decimal("10000.00")


def test_dscr():
    assert calculate_dscr(Decimal("1200000"), Decimal("600000")) == Decimal("2.00")


def test_foir():
    assert calculate_foir(Decimal("30000"), Decimal("100000")) == Decimal("0.30")


def test_invalid_inputs_raise():
    with pytest.raises(ValueError):
        calculate_emi(Decimal("-1"), Decimal("12"), 12)
    with pytest.raises(ValueError):
        calculate_dscr(Decimal("100"), Decimal("0"))
    with pytest.raises(ValueError):
        calculate_foir(Decimal("100"), Decimal("0"))