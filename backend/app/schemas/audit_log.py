from pydantic import BaseModel
from typing import Optional, Any
from datetime import datetime

class AuditLogOut(BaseModel):
    id: int
    user_id: Optional[int]
    action: str
    action_type: Optional[str] = None
    entity: str
    entity_id: Optional[int]
    module_name: Optional[str] = None
    record_id: Optional[int] = None
    details: Optional[Any] = None
    old_data: Optional[Any] = None
    new_data: Optional[Any] = None
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None
    timestamp: datetime

    class Config:
        from_attributes = True
