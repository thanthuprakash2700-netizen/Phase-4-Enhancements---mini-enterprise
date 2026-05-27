# backend/app/models/user.py

from sqlalchemy import Integer, String, Boolean, DateTime, func, ForeignKey
from sqlalchemy.orm import relationship, Mapped, mapped_column
from typing import Optional, Any
from datetime import datetime
from . import Base

class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[str] = mapped_column(String(50), nullable=False)  # admin, manager, employee
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    organization_id: Mapped[Optional[int]] = mapped_column(Integer, ForeignKey("organizations.id"), index=True, nullable=True)

    organization: Mapped[Optional[Any]] = relationship("Organization", back_populates="users")
