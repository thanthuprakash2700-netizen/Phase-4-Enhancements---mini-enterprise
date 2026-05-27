from pydantic import BaseModel
from typing import Optional, Any
from datetime import datetime

class AuditLogOut(BaseModel):
    id: int
    user_id: Optional[int]
    action: str
    entity: str
    entity_id: Optional[int]
    details: Optional[Any] = None
    timestamp: datetime

    class Config:
        from_attributes = True
