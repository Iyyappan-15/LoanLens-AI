from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="LoanLens AI API",
    description="Deterministic Financial Underwriting & AI-Assisted Document Intelligence for MSMEs",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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
