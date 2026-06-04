from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.db.session import get_db
from app.schemas.workflow import ApprovalDelegationCreate, ApprovalDelegationOut
from app.services.approval_service import ApprovalService
from app.api.deps import get_current_user
from app.models.user import User

router = APIRouter(prefix="/approval-delegations", tags=["Approval Delegations"])

@router.post("", response_model=ApprovalDelegationOut)
def create_approval_delegation(delegation_in: ApprovalDelegationCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return ApprovalService.delegate_approval(db, delegation_in, current_user)

@router.get("/me", response_model=List[ApprovalDelegationOut])
def view_my_delegations(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return ApprovalService.get_delegations(db, current_user)

@router.get("/active", response_model=List[ApprovalDelegationOut])
def view_active_delegations(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    from app.models.approval import ApprovalDelegation
    return db.query(ApprovalDelegation).filter(
        ApprovalDelegation.delegator_id == current_user.id,
        ApprovalDelegation.is_active == True
    ).all()

@router.put("/{id}/cancel", response_model=ApprovalDelegationOut)
def cancel_delegation(id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    from app.models.approval import ApprovalDelegation
    delegation = db.query(ApprovalDelegation).filter(ApprovalDelegation.id == id).first()
    if not delegation:
        raise HTTPException(status_code=404, detail="Delegation not found")
    delegation.is_active = False
    db.commit()
    db.refresh(delegation)
    return delegation
