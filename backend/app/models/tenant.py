# backend/app/models/tenant.py

from sqlalchemy import Integer, String, DateTime, func, ForeignKey, Enum
from sqlalchemy.orm import relationship, Mapped, mapped_column
from typing import List, Optional, Any
from datetime import datetime
import enum
from . import Base

class PlanEnum(str, enum.Enum):
    basic = "basic"
    silver = "silver"
    gold = "gold"

class SubscriptionStatus(str, enum.Enum):
    active = "active"
    past_due = "past_due"
    canceled = "canceled"
    trialing = "trialing"

class Organization(Base):
    __tablename__ = "organizations"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    
    stripe_customer_id: Mapped[Optional[str]] = mapped_column(String(255), nullable=True, unique=True, index=True)
    credits: Mapped[int] = mapped_column(Integer, default=100, nullable=False)

    users: Mapped[List[Any]] = relationship("User", back_populates="organization", cascade="all, delete-orphan")
    subscription: Mapped[Optional[Any]] = relationship("Subscription", back_populates="organization", uselist=False, cascade="all, delete-orphan")

class Subscription(Base):
    __tablename__ = "subscriptions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    organization_id: Mapped[int] = mapped_column(Integer, ForeignKey("organizations.id"), unique=True, index=True, nullable=False)
    plan_name: Mapped[PlanEnum] = mapped_column(Enum(PlanEnum), default=PlanEnum.basic, nullable=False)
    status: Mapped[SubscriptionStatus] = mapped_column(Enum(SubscriptionStatus), default=SubscriptionStatus.trialing, nullable=False)
    
    stripe_subscription_id: Mapped[Optional[str]] = mapped_column(String(255), nullable=True, unique=True, index=True)
    current_period_end: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    organization: Mapped[Any] = relationship("Organization", back_populates="subscription")
