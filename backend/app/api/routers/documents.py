from fastapi import APIRouter, Depends, UploadFile, File, BackgroundTasks
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.document import DocumentOut
from app.api.deps import get_current_user
from app.models.user import User
from app.api.routers.ws import manager
from app.services.document_service import DocumentService
from fastapi_pagination import Page

router = APIRouter()

@router.post("/upload", response_model=DocumentOut)
def upload_document(
    background_tasks: BackgroundTasks,
    task_id: int = None,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    new_doc = DocumentService.upload_document(db, file, task_id, current_user)
    
    background_tasks.add_task(manager.broadcast, {"type": "DOCUMENT_UPLOADED", "document_id": new_doc.id, "task_id": task_id})

    return new_doc

@router.get("/task/{task_id}", response_model=Page[DocumentOut])
def get_task_documents(
    task_id: int, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    return DocumentService.get_task_documents(db, task_id, current_user)

@router.get("/general", response_model=Page[DocumentOut])
def get_general_documents(
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    return DocumentService.get_general_documents(db, current_user)

@router.get("/{id}", response_model=DocumentOut)
def get_document(id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return DocumentService.get_document(db, id, current_user)

@router.get("/{id}/download")
def download_document(id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    doc = DocumentService.download_document(db, id, current_user)
    return FileResponse(path=doc.file_path, filename=doc.file_name)
