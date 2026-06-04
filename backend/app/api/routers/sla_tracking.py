from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.db.session import get_db
from app.schemas.sla import SLATrackingCreate, SLATrackingOut
from app.services.sla_service import SLAService
from app.api.deps import get_current_user
from app.models.user import User

router = APIRouter(prefix="/sla-tracking", tags=["SLA Tracking"])

@router.post("/tasks/{task_id}", response_model=SLATrackingOut)
def start_sla_tracking_task(task_id: int, tracking_in: SLATrackingCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return SLAService.start_sla_tracking(db, tracking_in)

@router.post("/approvals/{approval_id}", response_model=SLATrackingOut)
def start_sla_tracking_approval(approval_id: int, tracking_in: SLATrackingCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return SLAService.start_sla_tracking(db, tracking_in)

@router.put("/{id}/complete", response_model=SLATrackingOut)
def complete_sla_tracking(id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return SLAService.complete_sla_tracking(db, tracking_id=id)

@router.get("/active", response_model=List[SLATrackingOut])
def get_active_sla_tracking(skip: int = 0, limit: int = 100, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return SLAService.get_active_sla_tracking(db, skip=skip, limit=limit)

@router.get("/breached", response_model=List[SLATrackingOut])
def get_breached_sla_tracking(skip: int = 0, limit: int = 100, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return SLAService.get_breached_sla_tracking(db, skip=skip, limit=limit)

@router.get("/record/{module_name}/{record_id}", response_model=SLATrackingOut)
def get_sla_tracking_for_record(module_name: str, record_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return SLAService.get_sla_tracking_for_record(db, module_name=module_name, record_id=record_id)
