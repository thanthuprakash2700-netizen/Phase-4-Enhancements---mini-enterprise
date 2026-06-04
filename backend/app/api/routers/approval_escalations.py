from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
from app.db.session import get_db
from app.schemas.workflow import ApprovalEscalationCreate, ApprovalEscalationOut
from app.services.approval_service import ApprovalService
from app.api.deps import get_current_user
from app.models.user import User

router = APIRouter(prefix="/approval-escalations", tags=["Approval Escalations"])

@router.post("", response_model=ApprovalEscalationOut)
def escalate_approval(escalation_in: ApprovalEscalationCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return ApprovalService.escalate_approval(db, escalation_in, current_user)

@router.get("", response_model=List[ApprovalEscalationOut])
def list_escalations(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return ApprovalService.get_escalations(db, current_user)

@router.get("/pending", response_model=List[ApprovalEscalationOut])
def list_pending_escalations(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    from app.models.approval import ApprovalEscalation
    return db.query(ApprovalEscalation).filter(ApprovalEscalation.status == "pending", ApprovalEscalation.escalated_to == current_user.id).all()

@router.get("/approval/{approval_id}", response_model=List[ApprovalEscalationOut])
def view_escalation_history(approval_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    from app.models.approval import ApprovalEscalation
    return db.query(ApprovalEscalation).filter(ApprovalEscalation.approval_id == approval_id).all()

@router.put("/{id}/resolve", response_model=ApprovalEscalationOut)
def resolve_escalation(id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    from app.models.approval import ApprovalEscalation
    escalation = db.query(ApprovalEscalation).filter(ApprovalEscalation.id == id).first()
    if not escalation:
        raise HTTPException(status_code=404, detail="Escalation not found")
    escalation.status = "resolved"
    escalation.resolved_at = datetime.now()
    db.commit()
    db.refresh(escalation)
    return escalation

@router.put("/{id}/cancel", response_model=ApprovalEscalationOut)
def cancel_escalation(id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    from app.models.approval import ApprovalEscalation
    escalation = db.query(ApprovalEscalation).filter(ApprovalEscalation.id == id).first()
    if not escalation:
        raise HTTPException(status_code=404, detail="Escalation not found")
    escalation.status = "cancelled"
    escalation.resolved_at = datetime.now()
    db.commit()
    db.refresh(escalation)
    return escalation
