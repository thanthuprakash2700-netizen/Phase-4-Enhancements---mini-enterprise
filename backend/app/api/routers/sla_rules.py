from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.db.session import get_db
from app.schemas.sla import SLARuleCreate, SLARuleUpdate, SLARuleOut
from app.services.sla_service import SLAService
from app.api.deps import get_current_user
from app.models.user import User

router = APIRouter(prefix="/sla-rules", tags=["SLA Rules"])

@router.post("", response_model=SLARuleOut)
def create_sla_rule(rule_in: SLARuleCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return SLAService.create_sla_rule(db, rule_in, current_user.id)

@router.get("", response_model=List[SLARuleOut])
def list_sla_rules(skip: int = 0, limit: int = 100, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return SLAService.get_sla_rules(db, skip=skip, limit=limit)

@router.get("/{id}", response_model=SLARuleOut)
def get_sla_rule(id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return SLAService.get_sla_rule(db, rule_id=id)

@router.put("/{id}", response_model=SLARuleOut)
def update_sla_rule(id: int, rule_in: SLARuleUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return SLAService.update_sla_rule(db, rule_id=id, rule_in=rule_in)

@router.delete("/{id}", response_model=SLARuleOut)
def disable_sla_rule(id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return SLAService.delete_sla_rule(db, rule_id=id)
