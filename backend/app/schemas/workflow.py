from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class ApprovalEscalationCreate(BaseModel):
    approval_id: int
    escalated_to: int
    reason: str

class ApprovalEscalationOut(BaseModel):
    id: int
    approval_id: int
    escalated_from: int
    escalated_to: int
    reason: str
    escalation_level: int
    status: str
    escalated_at: datetime
    resolved_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class ApprovalDelegationCreate(BaseModel):
    delegatee_id: int
    start_date: datetime
    end_date: datetime
    reason: str

class ApprovalDelegationOut(BaseModel):
    id: int
    delegator_id: int
    delegatee_id: int
    start_date: datetime
    end_date: datetime
    reason: str
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True
