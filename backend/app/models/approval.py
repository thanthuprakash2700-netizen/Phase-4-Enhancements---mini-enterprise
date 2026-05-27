# backend/app/models/approval.py

from sqlalchemy import Integer, String, Text, DateTime, ForeignKey, func, Enum
from sqlalchemy.orm import relationship, Mapped, mapped_column
from typing import Optional, Any, List
from datetime import datetime
from . import Base
import enum

class ApprovalStatus(str, enum.Enum):
    pending = "pending"
    approved = "approved"
    rejected = "rejected"
    hold = "hold"

class ApprovalLevel(str, enum.Enum):
    manager = "manager"
    admin = "admin"

class Approval(Base):
    __tablename__ = "approvals"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    requested_by_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"), index=True, nullable=False)
    status: Mapped[str] = mapped_column(String(50), default=ApprovalStatus.pending, nullable=False)
    current_level: Mapped[str] = mapped_column(String(50), default=ApprovalLevel.manager, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    organization_id: Mapped[Optional[int]] = mapped_column(Integer, ForeignKey("organizations.id"), index=True, nullable=True)

    requester: Mapped[Any] = relationship("User", foreign_keys=[requested_by_id])
    history: Mapped[List[Any]] = relationship("ApprovalHistory", back_populates="approval", cascade="all, delete-orphan")
    organization: Mapped[Optional[Any]] = relationship("Organization")

    @property
    def requester_name(self):
        return self.requester.name if self.requester else "Unknown"

class ApprovalHistory(Base):
    __tablename__ = "approval_history"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    approval_id: Mapped[int] = mapped_column(Integer, ForeignKey("approvals.id"), index=True, nullable=False)
    action_by_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"), index=True, nullable=False)
    action: Mapped[str] = mapped_column(String(50), nullable=False)  # approved, rejected, hold
    comment: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    approval: Mapped[Any] = relationship("Approval", back_populates="history")
    actor: Mapped[Any] = relationship("User", foreign_keys=[action_by_id])

    @property
    def actor_name(self):
        return self.actor.name if self.actor else "Unknown"
