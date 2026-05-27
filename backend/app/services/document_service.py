from fastapi import HTTPException, UploadFile
from sqlalchemy.orm import Session
from sqlalchemy import select
from fastapi_pagination.ext.sqlalchemy import paginate
import os
import shutil
from typing import List

from app.models.document import Document
from app.models.audit_log import AuditLog
from app.models.task import Task
from app.models.user import User

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

ALLOWED_EXTENSIONS = {".pdf", ".doc", ".docx", ".txt", ".png", ".jpg", ".jpeg", ".xls", ".xlsx", ".csv", ".zip"}
MAX_FILE_SIZE = 5 * 1024 * 1024

class DocumentService:
    @staticmethod
    def _validate_task_access(db: Session, task_id: int, current_user: User) -> Task:
        task = db.execute(select(Task).where(Task.id == task_id, Task.organization_id == current_user.organization_id)).scalars().first()
        if not task:
            raise HTTPException(status_code=404, detail="Task not found")
        
        if current_user.role == "manager":
            if task.created_by_id != current_user.id and task.assigned_to_id != current_user.id:
                raise HTTPException(status_code=403, detail="Not authorized to access this task's workspace")
        elif current_user.role == "employee":
            if task.assigned_to_id != current_user.id:
                raise HTTPException(status_code=403, detail="Not authorized to access this task's workspace")
        
        return task

    @staticmethod
    def upload_document(db: Session, file: UploadFile, task_id: int, current_user: User) -> Document:
        if task_id:
            DocumentService._validate_task_access(db, task_id, current_user)
        
        base, ext = os.path.splitext(file.filename)
        if ext.lower() not in ALLOWED_EXTENSIONS:
            raise HTTPException(
                status_code=400, 
                detail=f"File type {ext} not allowed. Supported formats: {', '.join(ALLOWED_EXTENSIONS)}"
            )
        
        file.file.seek(0, 2)
        file_size = file.file.tell()
        file.file.seek(0)
        if file_size > MAX_FILE_SIZE:
            raise HTTPException(status_code=400, detail="File size exceeds maximum limit of 5MB")

        existing_docs = db.execute(select(Document).where(
            Document.file_name == file.filename,
            Document.task_id == task_id,
            Document.organization_id == current_user.organization_id
        ).order_by(Document.version.desc())).scalars().all()
        
        version = 1
        if existing_docs:
            version = existing_docs[0].version + 1
            
        unique_filename = f"{base}_v{version}{ext}"
        file_path = os.path.join(UPLOAD_DIR, unique_filename)
        
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        new_doc = Document(
            file_name=file.filename,
            file_path=file_path,
            version=version,
            uploaded_by_id=current_user.id,
            task_id=task_id,
            organization_id=current_user.organization_id
        )
        db.add(new_doc)
        db.commit()
        db.refresh(new_doc)
        
        audit = AuditLog(
            user_id=current_user.id,
            action="UPLOAD_DOCUMENT",
            entity="DOCUMENT",
            entity_id=new_doc.id,
            details={"file_name": new_doc.file_name, "version": new_doc.version},
            organization_id=current_user.organization_id
        )
        db.add(audit)
        db.commit()
        
        return new_doc

    @staticmethod
    def get_document(db: Session, doc_id: int, current_user: User) -> Document:
        doc = db.execute(select(Document).where(Document.id == doc_id, Document.organization_id == current_user.organization_id)).scalars().first()
        if not doc:
            raise HTTPException(status_code=404, detail="Document not found")
        
        if doc.task_id:
            DocumentService._validate_task_access(db, doc.task_id, current_user)
            
        return doc

    @staticmethod
    def download_document(db: Session, doc_id: int, current_user: User) -> Document:
        doc = db.execute(select(Document).where(Document.id == doc_id, Document.organization_id == current_user.organization_id)).scalars().first()
        if not doc:
            raise HTTPException(status_code=404, detail="Document not found")
        
        if doc.task_id:
            DocumentService._validate_task_access(db, doc.task_id, current_user)
            
        if not os.path.exists(doc.file_path):
            raise HTTPException(status_code=404, detail="File content not found on disk")
            
        audit = AuditLog(
            user_id=current_user.id,
            action="DOWNLOAD_DOCUMENT",
            entity="DOCUMENT",
            entity_id=doc.id,
            details={"file_name": doc.file_name},
            organization_id=current_user.organization_id
        )
        db.add(audit)
        db.commit()
        
        return doc

    @staticmethod
    def get_task_documents(db: Session, task_id: int, current_user: User):
        DocumentService._validate_task_access(db, task_id, current_user)
        q = select(Document).where(Document.task_id == task_id, Document.organization_id == current_user.organization_id)
        q = q.order_by(Document.id.desc())
        return paginate(db, q)

    @staticmethod
    def get_general_documents(db: Session, current_user: User):
        q = select(Document).where(Document.task_id.is_(None), Document.organization_id == current_user.organization_id)
        q = q.order_by(Document.id.desc())
        return paginate(db, q)
