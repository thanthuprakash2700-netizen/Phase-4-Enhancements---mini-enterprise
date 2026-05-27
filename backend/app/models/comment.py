# backend/app/models/comment.py

from sqlalchemy import Integer, Text, Boolean, DateTime, ForeignKey, func
from sqlalchemy.orm import relationship, Mapped, mapped_column
from typing import Optional, Any
from datetime import datetime
from . import Base

class Comment(Base):
    __tablename__ = "comments"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    task_id: Mapped[int] = mapped_column(Integer, ForeignKey("tasks.id"), index=True, nullable=False)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"), index=True, nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    is_internal: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    organization_id: Mapped[Optional[int]] = mapped_column(Integer, ForeignKey("organizations.id"), index=True, nullable=True)

    task: Mapped[Any] = relationship("Task", backref="comments")
    user: Mapped[Any] = relationship("User")
    organization: Mapped[Optional[Any]] = relationship("Organization")

    @property
    def user_name(self):
        return self.user.name if self.user else "Unknown"
