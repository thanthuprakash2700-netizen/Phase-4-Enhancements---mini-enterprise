from fastapi import APIRouter, Depends, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List

from app.db.session import get_db
from app.api import deps
from app.models.user import User
from app.schemas.approval import ApprovalCreate, ApprovalOut, ApprovalAction, ApprovalHistoryOut
from app.api.routers.ws import manager
from app.services.approval_service import ApprovalService
from fastapi_pagination import Page

router = APIRouter(prefix="/approvals", tags=["approvals"])

@router.post("/", response_model=ApprovalOut)
def create_approval(
    approval_in: ApprovalCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_user)
):
    approval, notifs = ApprovalService.create_approval(db, approval_in, current_user)

    for notif in notifs:
        background_tasks.add_task(manager.send_personal_message, {"type": "NOTIFICATION_NEW", "message": notif.message}, notif.user_id)
            
    background_tasks.add_task(manager.broadcast_to_org, {"type": "APPROVAL_REQUESTED", "approval_id": approval.id}, current_user.organization_id)

    return approval

@router.get("/", response_model=Page[ApprovalOut])
def list_approvals(
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_user)
):
    return ApprovalService.list_approvals(db, current_user)


@router.patch("/{id}/action", response_model=ApprovalOut)
def take_approval_action(
    id: int,
    action_in: ApprovalAction,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_user)
):
    approval, notif = ApprovalService.take_approval_action(db, id, action_in, current_user)
    
    background_tasks.add_task(manager.broadcast_to_org, {"type": "APPROVAL_UPDATED", "approval_id": approval.id}, current_user.organization_id)
    background_tasks.add_task(manager.send_personal_message, {"type": "NOTIFICATION_NEW", "message": notif.message}, approval.requested_by_id)
    
    return approval

@router.get("/{id}/history", response_model=List[ApprovalHistoryOut])
def get_approval_history(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_user)
):
    return ApprovalService.get_approval_history(db, id, current_user)
