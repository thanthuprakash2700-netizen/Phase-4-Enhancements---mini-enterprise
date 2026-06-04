# backend/app/api/routers/notification_preferences.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import select

from app.db.session import get_db
from app.models.notification_preference import NotificationPreference
from app.schemas.notification_preference import NotificationPreferenceCreate, NotificationPreferenceUpdate, NotificationPreferenceOut
from app.api.deps import get_current_user
from app.models.user import User

router = APIRouter()

@router.get("/me", response_model=NotificationPreferenceOut)
def get_my_preferences(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    stmt = select(NotificationPreference).where(NotificationPreference.user_id == current_user.id)
    pref = db.execute(stmt).scalar_one_or_none()
    if not pref:
        # Auto-create if not exists
        pref = NotificationPreference(user_id=current_user.id)
        db.add(pref)
        db.commit()
        db.refresh(pref)
    return pref

@router.put("/me", response_model=NotificationPreferenceOut)
def update_my_preferences(
    pref_in: NotificationPreferenceUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    stmt = select(NotificationPreference).where(NotificationPreference.user_id == current_user.id)
    pref = db.execute(stmt).scalar_one_or_none()
    if not pref:
        pref = NotificationPreference(user_id=current_user.id)
        db.add(pref)
        db.flush()

    update_data = pref_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(pref, field, value)
    
    db.commit()
    db.refresh(pref)
    return pref

@router.post("/default/{user_id}", response_model=NotificationPreferenceOut, status_code=status.HTTP_201_CREATED)
def create_default_preferences(
    user_id: int,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_user)
):
    if current_admin.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    
    # Check if user exists (optional depending on app logic)
    user_stmt = select(User).where(User.id == user_id)
    target_user = db.execute(user_stmt).scalar_one_or_none()
    if not target_user:
        raise HTTPException(status_code=404, detail="User not found")
        
    stmt = select(NotificationPreference).where(NotificationPreference.user_id == user_id)
    existing_pref = db.execute(stmt).scalar_one_or_none()
    
    if existing_pref:
        raise HTTPException(status_code=400, detail="Preferences already exist for this user")
        
    pref = NotificationPreference(user_id=user_id)
    db.add(pref)
    db.commit()
    db.refresh(pref)
    return pref
