# backend/app/schemas/notification_preference.py
from pydantic import BaseModel, ConfigDict
from datetime import datetime

class NotificationPreferenceBase(BaseModel):
    in_app_enabled: bool = True
    email_enabled: bool = True
    task_notifications: bool = True
    approval_notifications: bool = True
    escalation_notifications: bool = True
    document_notifications: bool = True

class NotificationPreferenceCreate(NotificationPreferenceBase):
    pass

class NotificationPreferenceUpdate(BaseModel):
    in_app_enabled: bool | None = None
    email_enabled: bool | None = None
    task_notifications: bool | None = None
    approval_notifications: bool | None = None
    escalation_notifications: bool | None = None
    document_notifications: bool | None = None

class NotificationPreferenceOut(NotificationPreferenceBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
