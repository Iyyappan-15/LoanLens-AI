OFFICER = {"X-Reviewer-Id": "officer1", "X-Reviewer-Role": "CREDIT_OFFICER"}
AGENT = {"X-Reviewer-Id": "bot", "X-Reviewer-Role": "AI_AGENT"}

CASE = {
    "applicant_name": "Ravi Kumar",
    "business_name": "Kumar Traders",
    "loan_amount": "2500000",
    "tenure_months": 36,
    "declared_turnover": "6000000",
}
INPUTS = {
    "gst_turnover": "5800000",
    "bank_credits_turnover": "4200000",
    "annual_net_operating_income": "1800000",
    "existing_monthly_obligations": "20000",
    "interest_rate_pct": "12",
}


def make_case(client) -> str:
    r = client.post("/api/v1/cases", json=CASE)
    assert r.status_code == 201
    assert r.json()["status"] == "DRAFT"
    return r.json()["id"]


def upload(client, case_id, doc_type, name="a.pdf", content=b"%PDF-1.4 test"):
    return client.post(
        "/api/v1/documents",
        data={"case_id": case_id, "doc_type": doc_type},
        files={"file": (name, content, "application/pdf")},
    )


def upload_all(client, case_id):
    for t in ("BANK_STATEMENT", "GST_RETURN", "ITR"):
        assert upload(client, case_id, t).status_code == 201


def move(client, case_id, target):
    return client.post(f"/api/v1/cases/{case_id}/status", json={"target": target})


def get_to_review(client) -> str:
    cid = make_case(client)
    upload_all(client, cid)
    for s in ("DOCUMENTS_UPLOADED", "ANALYSIS_IN_PROGRESS", "READY_FOR_REVIEW"):
        assert move(client, cid, s).status_code == 200
    return cid


# ---- validation ----
def test_invalid_case_is_rejected(client):
    assert client.post("/api/v1/cases", json={**CASE, "loan_amount": "-5"}).status_code == 422
    assert client.post("/api/v1/cases", json={"applicant_name": "x"}).status_code == 422


def test_invalid_uploads_are_rejected(client):
    cid = make_case(client)
    assert upload(client, cid, "ITR", name="notes.txt").status_code == 422
    assert upload(client, cid, "ITR", content=b"").status_code == 422
    assert upload(client, cid, "ITR", content=b"not a pdf").status_code == 422
    assert upload(client, "no-such-case", "ITR").status_code == 404


# ---- Case C: incomplete ----
def test_incomplete_case_is_blocked(client):
    cid = make_case(client)
    assert upload(client, cid, "BANK_STATEMENT").status_code == 201
    r = client.get(f"/api/v1/cases/{cid}/financials")
    assert r.status_code == 422
    assert set(r.json()["detail"]["missing_documents"]) == {"GST_RETURN", "ITR"}
    assert move(client, cid, "DOCUMENTS_UPLOADED").status_code == 422


# ---- financial numbers ----
def test_financials_match_hand_calculation(client):
    cid = make_case(client)
    upload_all(client, cid)
    assert client.put(f"/api/v1/cases/{cid}/financial-inputs", json=INPUTS).status_code == 200
    m = client.get(f"/api/v1/cases/{cid}/financials").json()
    assert m["proposed_emi"] == 83035.77
    assert m["dscr"] == 1.46
    assert m["foir"] == 0.69
    assert m["turnover_variance_percentage"] == 27.59
    assert m["repayment_capacity_status"] == "WEAK"


# ---- workflow + ledger ----
def test_approval_writes_ledger_only_for_authorized_officer(client):
    cid = get_to_review(client)

    assert client.post(f"/api/v1/cases/{cid}/review", json={"action": "APPROVE"}, headers=AGENT).status_code == 403
    assert client.post(f"/api/v1/cases/{cid}/review", json={"action": "APPROVE"}).status_code == 401
    assert client.get(f"/api/v1/cases/{cid}/ledger").json() == []

    r = client.post(f"/api/v1/cases/{cid}/review", json={"action": "APPROVE"}, headers=OFFICER)
    assert r.status_code == 201
    ledger = client.get(f"/api/v1/cases/{cid}/ledger").json()
    assert len(ledger) == 1 and ledger[0]["approved_by"] == "officer1"

    # final state: a second decision is invalid
    assert client.post(f"/api/v1/cases/{cid}/review", json={"action": "REJECT", "comment": "x"}, headers=OFFICER).status_code == 409


def test_reject_and_request_info_write_no_ledger(client):
    cid = get_to_review(client)
    assert client.post(f"/api/v1/cases/{cid}/review", json={"action": "REJECT"}, headers=OFFICER).status_code == 422  # comment required
    assert client.post(f"/api/v1/cases/{cid}/review", json={"action": "REQUEST_INFO", "comment": "Need ITR"}, headers=OFFICER).status_code == 201
    assert client.get(f"/api/v1/cases/{cid}").json()["status"] == "ADDITIONAL_DOCS_REQUESTED"
    assert client.get(f"/api/v1/cases/{cid}/ledger").json() == []


def test_cannot_review_before_ready(client):
    cid = make_case(client)
    r = client.post(f"/api/v1/cases/{cid}/review", json={"action": "APPROVE"}, headers=OFFICER)
    assert r.status_code == 409


def test_audit_trail_records_history(client):
    cid = get_to_review(client)
    client.post(f"/api/v1/cases/{cid}/review", json={"action": "APPROVE"}, headers=OFFICER)
    events = [e["event_type"] for e in client.get(f"/api/v1/cases/{cid}/audit").json()]
    assert events[0] == "CASE_CREATED"
    assert events[-1] == "REVIEW_APPROVE"
    assert events.count("STATUS_CHANGED") == 3