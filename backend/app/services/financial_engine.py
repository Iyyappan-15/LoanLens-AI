from decimal import Decimal, ROUND_HALF_UP

TWO_PLACES = Decimal("0.01")


def _q(value: Decimal) -> Decimal:
    return value.quantize(TWO_PLACES, rounding=ROUND_HALF_UP)


def calculate_emi(principal: Decimal, annual_rate_pct: Decimal, tenure_months: int) -> Decimal:
    """Monthly EMI using the standard reducing-balance formula."""
    if principal <= 0:
        raise ValueError("principal must be greater than 0")
    if tenure_months <= 0:
        raise ValueError("tenure_months must be greater than 0")
    if annual_rate_pct < 0:
        raise ValueError("annual_rate_pct cannot be negative")

    if annual_rate_pct == 0:
        return _q(principal / tenure_months)

    r = annual_rate_pct / Decimal(12) / Decimal(100)  # monthly rate
    growth = (1 + r) ** tenure_months
    return _q(principal * r * growth / (growth - 1))


def calculate_dscr(annual_net_operating_income: Decimal, annual_debt_service: Decimal) -> Decimal:
    """DSCR = net operating income / total annual debt service."""
    if annual_debt_service <= 0:
        raise ValueError("annual_debt_service must be greater than 0")
    return _q(annual_net_operating_income / annual_debt_service)


def calculate_foir(monthly_obligations: Decimal, monthly_income: Decimal) -> Decimal:
    """FOIR = fixed monthly obligations / monthly income, as a ratio (0.45 = 45%)."""
    if monthly_income <= 0:
        raise ValueError("monthly_income must be greater than 0")
    if monthly_obligations < 0:
        raise ValueError("monthly_obligations cannot be negative")
    return _q(monthly_obligations / monthly_income)