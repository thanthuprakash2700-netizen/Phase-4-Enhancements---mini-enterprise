# backend/app/schemas/approval.py

from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, List

class ApprovalHistoryBase(BaseModel):
    action: str
    comment: Optional[str] = None

class ApprovalHistoryCreate(ApprovalHistoryBase):
    pass

class ApprovalHistoryOut(ApprovalHistoryBase):
    id: int
    approval_id: int
    action_by_id: int
    actor_name: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class ApprovalBase(BaseModel):
    title: str
    description: Optional[str] = None

class ApprovalCreate(ApprovalBase):
    pass

class ApprovalAction(BaseModel):
    action: str  # approved, rejected, hold
    comment: Optional[str] = None

class ApprovalOut(ApprovalBase):
    id: int
    requested_by_id: int
    requester_name: Optional[str] = None
    status: str
    current_level: str
    created_at: datetime
    sla_status: Optional[str] = None
    sla_due_time: Optional[datetime] = None
    is_escalated: bool = False
    current_escalation_to: Optional[int] = None
    history: List[ApprovalHistoryOut] = []

    class Config:
        from_attributes = True
