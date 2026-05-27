# backend/app/models/document.py

from sqlalchemy import Integer, String, DateTime, ForeignKey, func
from sqlalchemy.orm import relationship, Mapped, mapped_column
from typing import Optional, Any
from datetime import datetime
from . import Base

class Document(Base):
    __tablename__ = "documents"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    file_name: Mapped[str] = mapped_column(String(255), nullable=False)
    file_path: Mapped[str] = mapped_column(String(500), nullable=False)
    version: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    uploaded_by_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"), index=True, nullable=False)
    task_id: Mapped[Optional[int]] = mapped_column(Integer, ForeignKey("tasks.id"), index=True, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    organization_id: Mapped[Optional[int]] = mapped_column(Integer, ForeignKey("organizations.id"), index=True, nullable=True)

    uploader: Mapped[Any] = relationship("User", foreign_keys=[uploaded_by_id])
    task: Mapped[Optional[Any]] = relationship("Task")
    organization: Mapped[Optional[Any]] = relationship("Organization")
