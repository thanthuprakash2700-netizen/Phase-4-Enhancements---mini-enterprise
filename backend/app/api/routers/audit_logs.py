from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import select
from fastapi_pagination.ext.sqlalchemy import paginate
from fastapi_pagination import Page

from app.db.session import get_db
from app.models.audit_log import AuditLog
from app.schemas.audit_log import AuditLogOut
from app.api.deps import get_current_user
from app.models.user import User

router = APIRouter()

@router.get("/", response_model=Page[AuditLogOut])
def get_audit_logs(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    stmt = select(AuditLog).where(
        AuditLog.organization_id == current_user.organization_id
    ).order_by(AuditLog.timestamp.desc())
    return paginate(db, stmt)

@router.get("/entity/{entity}/{entity_id}", response_model=Page[AuditLogOut])
def get_entity_audit_logs(
    entity: str, 
    entity_id: int, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    stmt = select(AuditLog).where(
        AuditLog.entity == entity.upper(),
        AuditLog.entity_id == entity_id,
        AuditLog.organization_id == current_user.organization_id
    ).order_by(AuditLog.timestamp.desc())
    return paginate(db, stmt)
