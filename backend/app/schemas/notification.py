"""
Pydantic v2 schemas for Notifications.
"""

from __future__ import annotations

from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class NotificationOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    receiver_id: UUID
    title: str
    message: str
    read: bool
    created_at: datetime


class NotificationCreate(BaseModel):
    receiver_id: UUID
    title: str = Field(..., min_length=1, max_length=255)
    message: str = Field(..., min_length=1)
