from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import select
from fastapi_pagination.ext.sqlalchemy import paginate
from fastapi_pagination import Page

from app.db.session import get_db
from app.models.notification import Notification
from app.schemas.notification import NotificationOut
from app.api.deps import get_current_user
from app.models.user import User

router = APIRouter()

@router.get("/", response_model=Page[NotificationOut])
def get_notifications(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    stmt = select(Notification).where(Notification.user_id == current_user.id).order_by(Notification.created_at.desc())
    return paginate(db, stmt)

@router.patch("/{id}/read", response_model=NotificationOut)
def mark_as_read(id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    stmt = select(Notification).where(Notification.id == id, Notification.user_id == current_user.id)
    notification = db.execute(stmt).scalars().first()
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")
    
    notification.is_read = True
    db.commit()
    db.refresh(notification)
    return notification
