from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class SLARuleBase(BaseModel):
    module_name: str
    priority: str
    allowed_hours: int
    escalation_enabled: bool = False
    escalation_after_hours: Optional[int] = None
    is_active: bool = True

class SLARuleCreate(SLARuleBase):
    pass

class SLARuleUpdate(BaseModel):
    priority: Optional[str] = None
    allowed_hours: Optional[int] = None
    escalation_enabled: Optional[bool] = None
    escalation_after_hours: Optional[int] = None
    is_active: Optional[bool] = None

class SLARuleOut(SLARuleBase):
    id: int
    created_by: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class SLATrackingBase(BaseModel):
    module_name: str
    record_id: int
    sla_rule_id: int
    start_time: datetime
    due_time: datetime
    status: str
    breach_reason: Optional[str] = None

class SLATrackingCreate(SLATrackingBase):
    pass

class SLATrackingOut(SLATrackingBase):
    id: int
    completed_time: Optional[datetime] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
