import os
import uuid
from pathlib import Path

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.case import Case
from app.models.document import Document
from app.schemas.document import (
    MANDATORY_DOCUMENT_TYPES,
    CompletenessOut,
    DocumentOut,
    DocumentType,
)

router = APIRouter(prefix="/api/v1", tags=["documents"])

UPLOAD_DIR = Path(__file__).resolve().parents[2] / "uploads"  # backend/uploads
MAX_FILE_SIZE_MB = int(os.getenv("MAX_FILE_SIZE_MB", "25"))
ALLOWED_EXTENSIONS = {".pdf", ".csv", ".xlsx"}


@router.post("/documents", response_model=DocumentOut, status_code=status.HTTP_201_CREATED)
async def upload_document(
    case_id: str = Form(...),
    doc_type: DocumentType = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    if db.get(Case, case_id) is None:
        raise HTTPException(status_code=404, detail=f"Case {case_id} not found")

    ext = Path(file.filename or "").suffix.lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=422,
            detail=f"Unsupported file type '{ext}'. Allowed: {sorted(ALLOWED_EXTENSIONS)}",
        )

    content = await file.read()
    if len(content) == 0:
        raise HTTPException(status_code=422, detail="Uploaded file is empty")
    if len(content) > MAX_FILE_SIZE_MB * 1024 * 1024:
        raise HTTPException(status_code=422, detail=f"File exceeds {MAX_FILE_SIZE_MB} MB limit")
    if ext == ".pdf" and not content.startswith(b"%PDF"):
        raise HTTPException(status_code=422, detail="File has a .pdf extension but is not a valid PDF")

    UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
    stored_name = f"{uuid.uuid4()}{ext}"  # never use the user's filename on disk
    (UPLOAD_DIR / stored_name).write_bytes(content)

    doc = Document(
        case_id=case_id,
        doc_type=doc_type,
        original_filename=Path(file.filename).name,
        stored_path=stored_name,
        size_bytes=len(content),
    )
    db.add(doc)
    db.commit()
    db.refresh(doc)
    return doc


@router.get("/cases/{case_id}/documents", response_model=list[DocumentOut])
def list_documents(case_id: str, db: Session = Depends(get_db)):
    if db.get(Case, case_id) is None:
        raise HTTPException(status_code=404, detail=f"Case {case_id} not found")
    return db.scalars(select(Document).where(Document.case_id == case_id)).all()


@router.get("/cases/{case_id}/documents/completeness", response_model=CompletenessOut)
def check_completeness(case_id: str, db: Session = Depends(get_db)):
    if db.get(Case, case_id) is None:
        raise HTTPException(status_code=404, detail=f"Case {case_id} not found")
    present = set(
        db.scalars(select(Document.doc_type).where(Document.case_id == case_id)).all()
    )
    missing = [t for t in MANDATORY_DOCUMENT_TYPES if t not in present]
    return CompletenessOut(
        case_id=case_id,
        is_complete=not missing,
        present=sorted(present, key=lambda t: t.value),
        missing=missing,
    )