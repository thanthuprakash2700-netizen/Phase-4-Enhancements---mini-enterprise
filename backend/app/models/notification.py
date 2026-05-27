# backend/app/models/notification.py
from sqlalchemy import Integer, String, Boolean, DateTime, ForeignKey, func
from sqlalchemy.orm import relationship, Mapped, mapped_column
from typing import Optional, Any
from datetime import datetime
from . import Base

class Notification(Base):
    __tablename__ = "notifications"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"), nullable=False)
    message: Mapped[str] = mapped_column(String(500), nullable=False)
    is_read: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    organization_id: Mapped[Optional[int]] = mapped_column(Integer, ForeignKey("organizations.id"), index=True, nullable=True)

    user: Mapped[Any] = relationship("User")
    organization: Mapped[Optional[Any]] = relationship("Organization")
