# backend/app/models/task.py

from sqlalchemy import Integer, String, Text, DateTime, ForeignKey, func, Enum
from sqlalchemy.orm import relationship, Mapped, mapped_column
from typing import Optional, Any, List
from datetime import datetime
from . import Base
import enum

class DelayRiskEnum(str, enum.Enum):
    low = "low"
    medium = "medium"
    high = "high"

class StatusEnum(str, enum.Enum):
    todo = "todo"
    in_progress = "in_progress"
    review = "review"
    done = "done"

class PriorityEnum(str, enum.Enum):
    low = "low"
    medium = "medium"
    high = "high"

class Task(Base):
    __tablename__ = "tasks"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    status: Mapped[StatusEnum] = mapped_column(Enum(StatusEnum), default=StatusEnum.todo, nullable=False)
    priority: Mapped[PriorityEnum] = mapped_column(Enum(PriorityEnum), default=PriorityEnum.medium, nullable=False)
    attention_required: Mapped[bool] = mapped_column(default=False, nullable=False)
    delay_risk: Mapped[DelayRiskEnum] = mapped_column(Enum(DelayRiskEnum), default=DelayRiskEnum.low, nullable=False)
    due_date: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    created_by_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"), index=True, nullable=False)
    assigned_to_id: Mapped[Optional[int]] = mapped_column(Integer, ForeignKey("users.id"), index=True, nullable=True)
    updated_by_id: Mapped[Optional[int]] = mapped_column(Integer, ForeignKey("users.id"), index=True, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    organization_id: Mapped[Optional[int]] = mapped_column(Integer, ForeignKey("organizations.id"), index=True, nullable=True)

    creator: Mapped[Any] = relationship("User", foreign_keys=[created_by_id])
    assignee: Mapped[Optional[Any]] = relationship("User", foreign_keys=[assigned_to_id])
    updater: Mapped[Optional[Any]] = relationship("User", foreign_keys=[updated_by_id])
    organization: Mapped[Optional[Any]] = relationship("Organization")

    @property
    def assigned_to_name(self):
        return self.assignee.name if self.assignee else None

    @property
    def created_by_name(self):
        return self.creator.name if self.creator else "Unknown"

    @property
    def updated_by_name(self):
        return self.updater.name if self.updater else None
