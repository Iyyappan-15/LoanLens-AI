from dataclasses import dataclass
from decimal import Decimal, ROUND_HALF_UP

from app.rules.underwriting_rules import TURNOVER_VARIANCE_MATERIAL_PCT

TWO_PLACES = Decimal("0.01")


@dataclass(frozen=True)
class VarianceResult:
    base_label: str
    compared_label: str
    base_amount: Decimal
    compared_amount: Decimal
    shortfall_pct: Decimal  # positive = compared is lower than base
    is_material: bool


def calculate_variance(
    base_label: str,
    base_amount: Decimal,
    compared_label: str,
    compared_amount: Decimal,
    threshold_pct: Decimal = TURNOVER_VARIANCE_MATERIAL_PCT,
) -> VarianceResult:
    if base_amount <= 0:
        raise ValueError(f"{base_label} must be greater than 0")
    if compared_amount < 0:
        raise ValueError(f"{compared_label} cannot be negative")

    pct = ((base_amount - compared_amount) / base_amount * 100).quantize(
        TWO_PLACES, rounding=ROUND_HALF_UP
    )
    return VarianceResult(
        base_label=base_label,
        compared_label=compared_label,
        base_amount=base_amount,
        compared_amount=compared_amount,
        shortfall_pct=pct,
        is_material=abs(pct) > threshold_pct,
    )


def reconcile_turnover(
    declared: Decimal, gst: Decimal, bank_credits: Decimal
) -> list[VarianceResult]:
    """Declared vs GST, GST vs bank credits, and declared vs bank credits."""
    return [
        calculate_variance("declared", declared, "gst", gst),
        calculate_variance("gst", gst, "bank_credits", bank_credits),
        calculate_variance("declared", declared, "bank_credits", bank_credits),
    ]