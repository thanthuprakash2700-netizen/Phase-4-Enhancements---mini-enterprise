from sqlalchemy import Integer, String, Text, DateTime, ForeignKey, func, Boolean
from sqlalchemy.orm import relationship, Mapped, mapped_column
from typing import Optional, Any, List
from datetime import datetime
from .base import Base

class SLARule(Base):
    __tablename__ = "sla_rules"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    module_name: Mapped[str] = mapped_column(String(50), nullable=False)
    priority: Mapped[str] = mapped_column(String(20), nullable=False)
    allowed_hours: Mapped[int] = mapped_column(Integer, nullable=False)
    escalation_enabled: Mapped[bool] = mapped_column(Boolean, default=False)
    escalation_after_hours: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_by: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), onupdate=func.now())

    creator: Mapped[Any] = relationship("User", foreign_keys=[created_by])
    tracking_records: Mapped[List["SLATracking"]] = relationship("SLATracking", back_populates="rule")

class SLATracking(Base):
    __tablename__ = "sla_tracking"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    module_name: Mapped[str] = mapped_column(String(50), nullable=False)
    record_id: Mapped[int] = mapped_column(Integer, nullable=False)
    sla_rule_id: Mapped[int] = mapped_column(Integer, ForeignKey("sla_rules.id"))
    start_time: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    due_time: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    completed_time: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    status: Mapped[str] = mapped_column(String(20), nullable=False) # pending, completed, breached
    breach_reason: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), onupdate=func.now())

    rule: Mapped["SLARule"] = relationship("SLARule", back_populates="tracking_records")
