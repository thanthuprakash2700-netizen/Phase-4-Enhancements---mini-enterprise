from pydantic import BaseModel
from datetime import datetime
from typing import Optional
from .user import UserOut

class NotificationOut(BaseModel):
    id: int
    user_id: int
    message: str
    is_read: bool
    notification_type: Optional[str] = None
    priority: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class NotificationUpdate(BaseModel):
    is_read: bool
