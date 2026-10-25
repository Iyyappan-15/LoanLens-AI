from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import Base, engine
from app.api import cases, documents
from app.models import case as case_model
from app.models import document as document_model  
from app.api import financials
from app.models import financial_inputs as financial_inputs_model  # noqa: F401
from app.api import reviews
from app.models import review as review_model  # noqa: F401
from app.models import audit as audit_model  # noqa: F401
app = FastAPI(
    title="LoanLens AI API",
    description="Deterministic Financial Underwriting & AI-Assisted Document Intelligence for MSMEs",
    version="0.1.0",
)
app.include_router(reviews.router)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
Base.metadata.create_all(bind=engine)
app.include_router(cases.router)
app.include_router(documents.router)
app.include_router(financials.router)
@app.get("/")
def health_check():
    return {
        "status": "healthy",
        "service": "LoanLens AI Backend",
        "version": "0.1.0",
        "architecture": "Deterministic Financial Engine + Evidence-First AI"
    }

@app.get("/api/v1/health")
def api_health():
    return {"status": "ok"}
